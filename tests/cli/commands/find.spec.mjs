// @ts-nocheck
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { afterEach, expect, test, vi } from 'vitest';
import yargs from 'yargs';
import RSSParser from 'rss-parser';

import { getAllSubscriptions, getMigratedDb } from '../../../src/database.mjs';
import * as findCommand from '../../../src/cli/commands/find.mjs';

const thisFileDir = path.dirname(fileURLToPath(import.meta.url));

const campRss = await fs.readFile(path.join(thisFileDir, '../../fixtures/camp.xml'), 'utf8');

const outputs = [];

const executeFindCommand = async(db, ...keywords) => {
  const argv = await yargs(['find', ...keywords])
    .command({ ...findCommand, handler: vi.fn() }).argv;

  await findCommand.handler(argv, () => db);
};

vi.mock('../../../src/utils.mjs', async(importOriginal) => {
  const mod = await importOriginal();
  return {
    ...mod,
    getRssListByKeywords: vi.fn(() => (new RSSParser).parseString(campRss)),
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

const EPISODE_TITLE_MAP = Object.freeze({
  '1': '【喵萌奶茶屋&千夏字幕組】【輕旅輕營_Yuru Camp】[第01話][1280x720][MP4][繁體]（諢名：搖曳露營）',
  '2': '【喵萌奶茶屋&千夏字幕組】【輕旅輕營_Yuru Camp】[第02話][1280x720][MP4][繁體]（諢名：搖曳露營）',
  '3': '【喵萌奶茶屋&千夏字幕組】【輕旅輕營_Yuru Camp】[第03話][1280x720][MP4][繁體]（諢名：搖曳露營）',
  '4': '【喵萌奶茶屋&千夏字幕組】【輕旅輕營_Yuru Camp】[第04話][1280x720][MP4][繁體]（諢名：搖曳露營）',
  '5': '【喵萌奶茶屋&千夏字幕組】【輕旅輕營_Yuru Camp】[第05話][1280x720][MP4][繁體]（諢名：搖曳露營）',
  '6': '【喵萌奶茶屋&千夏字幕組】【輕旅輕營_Yuru Camp】[第06話][1280x720][MP4][繁體]（諢名：搖曳露營）',
  '7': '【喵萌奶茶屋&千夏字幕組】【輕旅輕營_Yuru Camp】[第07話][1280x720][MP4][繁體]（諢名：搖曳露營）',
  '8': '【喵萌奶茶屋&千夏字幕組】【輕旅輕營_Yuru Camp】[第08話][1280x720][MP4][繁體]（諢名：搖曳露營）',
  '9': '【喵萌奶茶屋&千夏字幕組】【輕旅輕營_Yuru Camp】[第09話][1280x720][MP4][繁體]（諢名：搖曳露營）',
  '10': '【喵萌奶茶屋&千夏字幕組】【輕旅輕營_Yuru Camp】[第10話][1280x720][MP4][繁體]（諢名：搖曳露營）',
  '11': '【喵萌奶茶屋&千夏字幕組】【輕旅輕營_Yuru Camp】[第11話][1280x720][MP4][繁體]（諢名：搖曳露營）',
  '12': '【喵萌奶茶屋&千夏字幕組】【輕旅輕營_Yuru Camp】[第12話][完][1280x720][MP4][繁體]（諢名：搖曳露營）',
  '720p': '【喵萌奶茶屋&千夏字幕組】【輕旅輕營_Yuru Camp】[第01-12話][合集][1280x720][MP4][繁體]（諢名：搖曳露營）',
  '1080p': '【喵萌奶茶屋&千夏字幕組】【輕旅輕營_Yuru Camp】[第01-12話][合集][1920×1080][MP4][繁體]（諢名：搖曳露營）(附無損音樂)',
});

test('find 搖曳露營 喵萌', async() => {
  const db = await getMigratedDb(':memory:');

  await executeFindCommand(db, '搖曳露營', '喵萌');

  const s = (await getAllSubscriptions(db))[0];

  expect(s).toBeUndefined();
  expect(outputs)
    .include(EPISODE_TITLE_MAP[1])
    .include(EPISODE_TITLE_MAP[2])
    .include(EPISODE_TITLE_MAP[3])
    .include(EPISODE_TITLE_MAP[4])
    .include(EPISODE_TITLE_MAP[5])
    .include(EPISODE_TITLE_MAP[6])
    .include(EPISODE_TITLE_MAP[7])
    .include(EPISODE_TITLE_MAP[8])
    .include(EPISODE_TITLE_MAP[9])
    .include(EPISODE_TITLE_MAP[10])
    .include(EPISODE_TITLE_MAP[11])
    .include(EPISODE_TITLE_MAP[12])
    .include(EPISODE_TITLE_MAP['720p'])
    .include(EPISODE_TITLE_MAP['1080p']);
});

test('find 搖曳露營 喵萌 -x 合集', async() => {
  const db = await getMigratedDb(':memory:');

  await executeFindCommand(db, '搖曳露營', '喵萌', '-x', '合集');

  const s = (await getAllSubscriptions(db))[0];

  expect(s).toBeUndefined();
  expect(outputs)
    .include(EPISODE_TITLE_MAP[1])
    .include(EPISODE_TITLE_MAP[2])
    .include(EPISODE_TITLE_MAP[3])
    .include(EPISODE_TITLE_MAP[4])
    .include(EPISODE_TITLE_MAP[5])
    .include(EPISODE_TITLE_MAP[6])
    .include(EPISODE_TITLE_MAP[7])
    .include(EPISODE_TITLE_MAP[8])
    .include(EPISODE_TITLE_MAP[9])
    .include(EPISODE_TITLE_MAP[10])
    .include(EPISODE_TITLE_MAP[11])
    .include(EPISODE_TITLE_MAP[12])
    .not.include(EPISODE_TITLE_MAP['720p'])
    .not.include(EPISODE_TITLE_MAP['1080p']);
});

test('find 搖曳露營 喵萌 繁體 --then-add', async() => {
  const db = await getMigratedDb(':memory:');

  await executeFindCommand(db, '搖曳露營', '喵萌', '繁體', '--then-add');

  const s = (await getAllSubscriptions(db))[0];

  expect(s.title).toBe('搖曳露營');
  expect(s.keywords)
    .includes('搖曳露營')
    .includes('喵萌')
    .includes('繁體');
  expect(outputs)
    .include(EPISODE_TITLE_MAP[1])
    .include(EPISODE_TITLE_MAP[2])
    .include(EPISODE_TITLE_MAP[3])
    .include(EPISODE_TITLE_MAP[4])
    .include(EPISODE_TITLE_MAP[5])
    .include(EPISODE_TITLE_MAP[6])
    .include(EPISODE_TITLE_MAP[7])
    .include(EPISODE_TITLE_MAP[8])
    .include(EPISODE_TITLE_MAP[9])
    .include(EPISODE_TITLE_MAP[10])
    .include(EPISODE_TITLE_MAP[11])
    .include(EPISODE_TITLE_MAP[12])
    .include(EPISODE_TITLE_MAP['720p'])
    .include(EPISODE_TITLE_MAP['1080p']);
});
