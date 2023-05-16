// @ts-nocheck
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

import yargs from 'yargs';
import { afterEach, assert, expect, test, vi } from 'vitest';
import RSSParser from 'rss-parser';

import { getAllSubscriptions, getMigratedDb } from '../../../src/database.mjs';
import { t } from '../../../src/locale.mjs';

import * as addCommand from '../../../src/cli/commands/add.mjs';
import * as pullCommand from '../../../src/cli/commands/pull.mjs';
import * as removeCommand from '../../../src/cli/commands/remove.mjs';
import * as configCommand from '../../../src/cli/commands/config.mjs';


const thisFileDir = path.dirname(fileURLToPath(import.meta.url));

const campHalfRss = await fs.readFile(path.join(thisFileDir, '../../fixtures/camp-half.xml'), 'utf8');

const outputs = [];

const executeAddCommand = async(db, ...keywords) => {
  const argv = await yargs(['add', ...keywords])
    .command({ ...addCommand, handler: vi.fn() }).argv;

  await addCommand.handler(argv, () => db);
};

const executeRemoveCommand = async(db, ...sids) => {
  const argv = await yargs(['rm', ...sids])
    .command({ ...removeCommand, handler: vi.fn() }).argv;

  await removeCommand.handler(argv, () => db);
};

const executePullCommand = async(db, ...sids) => {
  const argv = await yargs(['pull', ...sids])
    .command({ ...pullCommand, handler: vi.fn() }).argv;

  await pullCommand.handler(argv, () => db);
};

const executeConfigCommand = async(db, name, value) => {
  const argv = await yargs(['config', name, value])
    .command({ ...configCommand, handler: vi.fn() }).argv;

  await configCommand.handler(argv, () => db);
};

vi.mock('../../../src/utils.mjs', async(importOriginal) => {
  const mod = await importOriginal();

  return {
    ...mod,
    getRssListByKeywords: vi.fn((a) => {
      if (a[0] === '搖曳露營') {
        return (new RSSParser).parseString(campHalfRss);
      }
    }),
  };
});

vi.mock('../../../src/logger.mjs', async(importOriginal) => {
  const mod = await importOriginal();
  return {
    ...mod,
    log: vi.fn((...args) => outputs.push(args.join(' '))),
  };
});

afterEach(() => {
  outputs.length = 0;
});

test('pull after removed', async() => {
  const db = await getMigratedDb(':memory:');

  await executeConfigCommand(db, 'downloader', 'stdout');

  await executeAddCommand(db, '搖曳露營');

  const allSubsAfterAdded1st = await getAllSubscriptions(db);
  assert(allSubsAfterAdded1st.length === 1);
  const sid1 = allSubsAfterAdded1st[0]?.sid;
  assert(sid1);

  await executePullCommand(db);
  await executeRemoveCommand(db, sid1, '-f');

  const allSubsAfterRemoved = await getAllSubscriptions(db);
  assert(allSubsAfterRemoved.length === 0);

  await executeAddCommand(db, '搖曳露營');

  const allSubsAfterAdded2nd = await getAllSubscriptions(db);
  assert(allSubsAfterAdded2nd.length === 1);
  const sid2 = allSubsAfterAdded1st[0]?.sid;
  assert(sid2);

  outputs.length = 0;

  await executePullCommand(db);

  const EPISODE_TITLE_MAP = Object.freeze({
    1: '【喵萌奶茶屋&千夏字幕組】【輕旅輕營_Yuru Camp】[第01話][1280x720][MP4][繁體]（諢名：搖曳露營）',
    2: '【喵萌奶茶屋&千夏字幕組】【輕旅輕營_Yuru Camp】[第02話][1280x720][MP4][繁體]（諢名：搖曳露營）',
    3: '【喵萌奶茶屋&千夏字幕組】【輕旅輕營_Yuru Camp】[第03話][1280x720][MP4][繁體]（諢名：搖曳露營）',
    4: '【喵萌奶茶屋&千夏字幕組】【輕旅輕營_Yuru Camp】[第04話][1280x720][MP4][繁體]（諢名：搖曳露營）',
    5: '【喵萌奶茶屋&千夏字幕組】【輕旅輕營_Yuru Camp】[第05話][1280x720][MP4][繁體]（諢名：搖曳露營）',
    6: '【喵萌奶茶屋&千夏字幕組】【輕旅輕營_Yuru Camp】[第06話][1280x720][MP4][繁體]（諢名：搖曳露營）',
  });

  expect(outputs)
    .include(t('CMD_PULL_SUCCESS', { title: EPISODE_TITLE_MAP[1] }))
    .include(t('CMD_PULL_SUCCESS', { title: EPISODE_TITLE_MAP[2] }))
    .include(t('CMD_PULL_SUCCESS', { title: EPISODE_TITLE_MAP[3] }))
    .include(t('CMD_PULL_SUCCESS', { title: EPISODE_TITLE_MAP[4] }))
    .include(t('CMD_PULL_SUCCESS', { title: EPISODE_TITLE_MAP[5] }))
    .include(t('CMD_PULL_SUCCESS', { title: EPISODE_TITLE_MAP[6] }));
});
