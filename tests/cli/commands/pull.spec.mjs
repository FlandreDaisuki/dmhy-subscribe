import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { afterEach, assert, expect, it, vi } from 'vitest';
import yargs from 'yargs';
import RSSParser from 'rss-parser';

import { getAllSubscriptions, getMigratedDb, getThreadsBySid } from '../../../src/database.mjs';
import * as addCommand from '../../../src/cli/commands/add.mjs';
import * as pullCommand from '../../../src/cli/commands/pull.mjs';
import * as configCommand from '../../../src/cli/commands/config.mjs';

const thisFileDir = path.dirname(fileURLToPath(import.meta.url));

const campRss = await fs.readFile(path.join(thisFileDir, '../../fixtures/camp.xml'), 'utf8');
const campHalfRss = await fs.readFile(path.join(thisFileDir, '../../fixtures/camp-half.xml'), 'utf8');
const bocchiRss = await fs.readFile(path.join(thisFileDir, '../../fixtures/bocchi.xml'), 'utf8');

const outputs = [];

const executeAddCommand = async (db, ...keywords) => {
  const argv = await yargs(['add', ...keywords])
    .command({ ...addCommand, handler: vi.fn() }).argv;

  await addCommand.handler(argv, () => db);
};

const executePullCommand = async (db, ...sids) => {
  const argv = await yargs(['pull', ...sids])
    .command({ ...pullCommand, handler: vi.fn() }).argv;

  await pullCommand.handler(argv, () => db);
};

const executeConfigCommand = async (db, key, value) => {
  const argv = await yargs(['config', key, value])
    .command({ ...configCommand, handler: vi.fn() }).argv;

  await configCommand.handler(argv, () => db);
};

function * mutableRssGen() {
  yield (new RSSParser()).parseString(campHalfRss);
  while (true) {
    yield (new RSSParser()).parseString(campRss);
  }
}

vi.mock('../../../src/utils.mjs', async (importOriginal) => {
  const mod = await importOriginal();
  const μ = mutableRssGen();
  const λ = mutableRssGen();

  return {
    ...mod,
    getRssListByKeywords: vi.fn((a) => {
      if (a[0] === '搖曳露營') {
        return (new RSSParser()).parseString(campRss);
      }
      if (a[0] === '孤獨搖滾') {
        return (new RSSParser()).parseString(bocchiRss);
      }
      if (a[0] === '搖曳露營μ') {
        return μ.next().value;
      }
      if (a[0] === '搖曳露營λ') {
        return λ.next().value;
      }
    }),
  };
});

vi.mock('../../../src/logger.mjs', async (importOriginal) => {
  const mod = await importOriginal();
  return {
    ...mod,
    log: vi.fn((...args) => outputs.push(args.join(' '))),
  };
});

afterEach(() => {
  outputs.length = 0;
});

it('pull all while no threads', async () => {
  const db = await getMigratedDb(':memory:');

  await executeAddCommand(db, '搖曳露營');
  await executeAddCommand(db, '孤獨搖滾');

  const allSubs = (await getAllSubscriptions(db));

  const sidMap = Object.freeze({
    搖曳露營: allSubs.find((sub) => sub.title === '搖曳露營')?.sid,
    孤獨搖滾: allSubs.find((sub) => sub.title === '孤獨搖滾')?.sid,
  });

  assert(sidMap['搖曳露營']);
  assert(sidMap['孤獨搖滾']);

  expect((await getThreadsBySid(sidMap['搖曳露營'], db))).toHaveLength(0);
  expect((await getThreadsBySid(sidMap['孤獨搖滾'], db))).toHaveLength(0);

  await executePullCommand(db);

  expect((await getThreadsBySid(sidMap['搖曳露營'], db))).toHaveLength(14);
  expect((await getThreadsBySid(sidMap['孤獨搖滾'], db))).toHaveLength(13);
});

it('pull specific subscription threads', async () => {
  const db = await getMigratedDb(':memory:');

  await executeAddCommand(db, '搖曳露營');
  await executeAddCommand(db, '孤獨搖滾');

  const allSubs = (await getAllSubscriptions(db));

  const sidMap = Object.freeze({
    搖曳露營: allSubs.find((sub) => sub.title === '搖曳露營')?.sid,
    孤獨搖滾: allSubs.find((sub) => sub.title === '孤獨搖滾')?.sid,
  });

  assert(sidMap['搖曳露營']);
  assert(sidMap['孤獨搖滾']);

  expect((await getThreadsBySid(sidMap['搖曳露營'], db))).toHaveLength(0);
  expect((await getThreadsBySid(sidMap['孤獨搖滾'], db))).toHaveLength(0);

  await executePullCommand(db, sidMap['搖曳露營']);

  expect((await getThreadsBySid(sidMap['搖曳露營'], db))).toHaveLength(14);
  expect((await getThreadsBySid(sidMap['孤獨搖滾'], db))).toHaveLength(0);
});

it('pull existing subscription threads', async () => {
  const db = await getMigratedDb(':memory:');

  await executeAddCommand(db, '搖曳露營μ');

  const { sid } = (await getAllSubscriptions(db))[0];

  expect((await getThreadsBySid(sid, db))).toHaveLength(0);

  await executePullCommand(db, sid);

  expect((await getThreadsBySid(sid, db))).toHaveLength(6);

  await executePullCommand(db, sid);

  expect((await getThreadsBySid(sid, db))).toHaveLength(14);
});

it('pull existing subscription threads then download it', async () => {
  const db = await getMigratedDb(':memory:');

  await executeConfigCommand(db, 'downloader', 'stdout');
  await executeAddCommand(db, '搖曳露營λ');

  const { sid } = (await getAllSubscriptions(db))[0];

  const EPISODE_MAGNET_MAP = Object.freeze({
    '1': 'magnet:?xt=urn:btih:IDLUTDLMCG7YDJZTBT5HHGQIY6QTNKXJ',
    '2': 'magnet:?xt=urn:btih:MRKTFKONQTEG2ASCXEWXH66VT2Q5MADT',
    '3': 'magnet:?xt=urn:btih:AY76EMLXUKH3JR7B3XHUFCPZ4VBBHYJP',
    '4': 'magnet:?xt=urn:btih:3Q72NGLG2KUZCTHTE2OTHB4H2NBXE7ZQ',
    '5': 'magnet:?xt=urn:btih:SZ43KCETN4IPDIGUVGSI3CHH52CBAIVL',
    '6': 'magnet:?xt=urn:btih:ZV2Z2QETYPWRW7DIQF4OHJFHEW2SZ5K3',
    '7': 'magnet:?xt=urn:btih:XF2DC4WDZNSTSLEQICHRLP65ENWN3EEQ',
    '8': 'magnet:?xt=urn:btih:3QA27W5UTECULW4HLTZVPIWATQV37VHR',
    '9': 'magnet:?xt=urn:btih:AF6P7WXQA73DC3ATZ7DYGEGPX6YYLAQH',
    '10': 'magnet:?xt=urn:btih:SG4VBVFLKPQGVYVCP7PJSQXIGOAZQYDR',
    '11': 'magnet:?xt=urn:btih:YNKKNF7G3J4H2TZLJUHGCEJX3G2IPN5O',
    '12': 'magnet:?xt=urn:btih:QGNSVK5F4Z54BPYWTFVH472KG233MOWE',
    '720p': 'magnet:?xt=urn:btih:TWPW33PMG7PBPZXD36ZXSPFL5UAL7LPO',
    '1080p': 'magnet:?xt=urn:btih:OZSUB2NYVQN5AQQCI5IWD63ODAYQERPU',
  });

  expect((await getThreadsBySid(sid, db))).toHaveLength(0);

  await executePullCommand(db, sid);

  expect((await getThreadsBySid(sid, db))).toHaveLength(6);

  await executePullCommand(db, sid, '--then-download');

  expect((await getThreadsBySid(sid, db))).toHaveLength(14);
  expect(outputs)
    .include(EPISODE_MAGNET_MAP[7])
    .include(EPISODE_MAGNET_MAP[8])
    .include(EPISODE_MAGNET_MAP[9])
    .include(EPISODE_MAGNET_MAP[10])
    .include(EPISODE_MAGNET_MAP[11])
    .include(EPISODE_MAGNET_MAP[12])
    .include(EPISODE_MAGNET_MAP['720p'])
    .include(EPISODE_MAGNET_MAP['1080p'])
    .not.include(EPISODE_MAGNET_MAP[1])
    .not.include(EPISODE_MAGNET_MAP[2])
    .not.include(EPISODE_MAGNET_MAP[3])
    .not.include(EPISODE_MAGNET_MAP[4])
    .not.include(EPISODE_MAGNET_MAP[5])
    .not.include(EPISODE_MAGNET_MAP[6]);
});
