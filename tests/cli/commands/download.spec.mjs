// @ts-nocheck
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { afterEach, describe, expect, test, vi } from 'vitest';
import yargs from 'yargs';
import RSSParser from 'rss-parser';

import { getAllSubscriptions, getMigratedDb } from '../../../src/database.mjs';
import * as addCommand from '../../../src/cli/commands/add.mjs';
import * as pullCommand from '../../../src/cli/commands/pull.mjs';
import * as downloadCommand from '../../../src/cli/commands/download.mjs';
import * as configCommand from '../../../src/cli/commands/config.mjs';

const thisFileDir = path.dirname(fileURLToPath(import.meta.url));

const campHalfRss = await fs.readFile(path.join(thisFileDir, '../../fixtures/camp-half.xml'), 'utf8');

const outputs = [];

const executeAddCommand = async(db, ...keywords) => {
  const argv = await yargs(['add', ...keywords])
    .command({ ...addCommand, handler: vi.fn() }).argv;

  await addCommand.handler(argv, () => db);
};

const executePullCommand = async(db, ...sids) => {
  const argv = await yargs(['pull', ...sids])
    .command({ ...pullCommand, handler: vi.fn() }).argv;

  await pullCommand.handler(argv, () => db);
};


const executeConfigCommand = async(db, key, value) => {
  const argv = await yargs(['config', key, value])
    .command({ ...configCommand, handler: vi.fn() }).argv;

  await configCommand.handler(argv, () => db);
};

const executeDownloadCommand = async(db, sid, ...queries) => {
  const argv = await yargs(['download', sid, ...queries])
    .command({ ...downloadCommand, handler: vi.fn() }).argv;

  await downloadCommand.handler(argv, () => db);
};

vi.mock('../../../src/utils.mjs', async(importOriginal) => {
  const mod = await importOriginal();
  return {
    ...mod,
    getRssListByKeywords: vi.fn(() => {
      return (new RSSParser).parseString(campHalfRss);
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

describe('download camp-half', async() => {
  afterEach(() => {
    outputs.length = 0;
  });

  const db = await getMigratedDb(':memory:');
  await executeAddCommand(db, '搖曳露營');
  await executePullCommand(db);
  await executeConfigCommand(db, 'downloader', 'stdout');

  const { sid } = (await getAllSubscriptions(db))[0];

  const EPISODE_MAGNET_MAP = Object.freeze({
    1: 'magnet:?xt=urn:btih:IDLUTDLMCG7YDJZTBT5HHGQIY6QTNKXJ',
    2: 'magnet:?xt=urn:btih:MRKTFKONQTEG2ASCXEWXH66VT2Q5MADT',
    3: 'magnet:?xt=urn:btih:AY76EMLXUKH3JR7B3XHUFCPZ4VBBHYJP',
    4: 'magnet:?xt=urn:btih:3Q72NGLG2KUZCTHTE2OTHB4H2NBXE7ZQ',
    5: 'magnet:?xt=urn:btih:SZ43KCETN4IPDIGUVGSI3CHH52CBAIVL',
    6: 'magnet:?xt=urn:btih:ZV2Z2QETYPWRW7DIQF4OHJFHEW2SZ5K3',
  });

  test('download all threads', async() => {
    outputs.length = 0;
    await executeDownloadCommand(db, sid);
    expect(outputs)
      .include(EPISODE_MAGNET_MAP[1])
      .include(EPISODE_MAGNET_MAP[2])
      .include(EPISODE_MAGNET_MAP[3])
      .include(EPISODE_MAGNET_MAP[4])
      .include(EPISODE_MAGNET_MAP[5])
      .include(EPISODE_MAGNET_MAP[6]);
  });

  test('download episode 2', async() => {
    outputs.length = 0;
    await executeDownloadCommand(db, sid, '2');
    expect(outputs)
      .include(EPISODE_MAGNET_MAP[2])
      .not.include(EPISODE_MAGNET_MAP[1])
      .not.include(EPISODE_MAGNET_MAP[3])
      .not.include(EPISODE_MAGNET_MAP[4])
      .not.include(EPISODE_MAGNET_MAP[5])
      .not.include(EPISODE_MAGNET_MAP[6]);
  });

  test('download episode 2~4', async() => {
    outputs.length = 0;
    await executeDownloadCommand(db, sid, '2~4');
    expect(outputs)
      .include(EPISODE_MAGNET_MAP[2])
      .include(EPISODE_MAGNET_MAP[3])
      .include(EPISODE_MAGNET_MAP[4])
      .not.include(EPISODE_MAGNET_MAP[1])
      .not.include(EPISODE_MAGNET_MAP[5])
      .not.include(EPISODE_MAGNET_MAP[6]);
  });

  test('download episode @2~4', async() => {
    outputs.length = 0;
    await executeDownloadCommand(db, sid, '@2~4');
    expect(outputs)
      .include(EPISODE_MAGNET_MAP[5])
      .include(EPISODE_MAGNET_MAP[4])
      .include(EPISODE_MAGNET_MAP[3])
      .not.include(EPISODE_MAGNET_MAP[1])
      .not.include(EPISODE_MAGNET_MAP[2])
      .not.include(EPISODE_MAGNET_MAP[6]);
  });
});
