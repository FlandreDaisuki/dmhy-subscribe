// @ts-nocheck
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { assert, expect, test, vi } from 'vitest';
import yargs from 'yargs';
import RSSParser from 'rss-parser';

import { getAllSubscriptions, getMigratedDb, getThreadsBySid } from '../../../src/database.mjs';
import * as addCommand from '../../../src/cli/commands/add.mjs';
import * as pullCommand from '../../../src/cli/commands/pull.mjs';

const thisFileDir = path.dirname(fileURLToPath(import.meta.url));

const campRss = await fs.readFile(path.join(thisFileDir, '../../fixtures/camp.xml'), 'utf8');
const campHalfRss = await fs.readFile(path.join(thisFileDir, '../../fixtures/camp-half.xml'), 'utf8');
const bocchiRss = await fs.readFile(path.join(thisFileDir, '../../fixtures/bocchi.xml'), 'utf8');

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

function * mutableRssGen(){
  yield (new RSSParser).parseString(campHalfRss);
  while (true) {
    yield (new RSSParser).parseString(campRss);
  }
}

vi.mock('../../../src/utils.mjs', async(importOriginal) => {
  const mod = await importOriginal();
  const μ = mutableRssGen();

  return {
    ...mod,
    getRssListByKeywords: vi.fn((a) => {
      if (a[0] === '搖曳露營') {
        return (new RSSParser).parseString(campRss);
      }
      if (a[0] === '孤獨搖滾') {
        return (new RSSParser).parseString(bocchiRss);
      }
      if (a[0] === '搖曳露營μ') {
        return μ.next().value;
      }
    }),
  };
});

vi.mock('../../../src/logger.mjs', async(importOriginal) => {
  const mod = await importOriginal();
  return {
    ...mod,
    log: vi.fn(),
    error: vi.fn(),
  };
});

test('pull all while no threads', async() => {
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

test('pull specific subscription threads', async() => {


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

test('pull existing subscription threads', async() => {
  const db = await getMigratedDb(':memory:');

  await executeAddCommand(db, '搖曳露營μ');

  const { sid } = (await getAllSubscriptions(db))[0];

  expect((await getThreadsBySid(sid, db))).toHaveLength(0);

  await executePullCommand(db, sid);

  expect((await getThreadsBySid(sid, db))).toHaveLength(6);

  await executePullCommand(db, sid);

  expect((await getThreadsBySid(sid, db))).toHaveLength(14);
});

  await executePullCommand(db, sidMap['搖曳露營μ']);

  expect((await getThreadsBySid(sidMap['搖曳露營μ'], db))).toHaveLength(14);
});


  const allSubs = (await getAllSubscriptions(db));

  const sidMap = Object.freeze({
    搖曳露營x: allSubs.find((sub) => sub.title === '搖曳露營x')?.sid,
  });

  assert(sidMap['搖曳露營x']);

  expect((await getThreadsBySid(sidMap['搖曳露營x'], db))).toHaveLength(0);

  await executePullCommand(db, sidMap['搖曳露營x']);

  expect((await getThreadsBySid(sidMap['搖曳露營x'], db))).toHaveLength(6);

  await executePullCommand(db, sidMap['搖曳露營x']);

  expect((await getThreadsBySid(sidMap['搖曳露營x'], db))).toHaveLength(14);
});
