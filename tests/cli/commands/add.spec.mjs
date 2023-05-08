// @ts-nocheck
import { expect, test, vi } from 'vitest';
import yargs from 'yargs';

import { getAllSubscriptions, getMigratedDb } from '../../../src/database.mjs';
import * as addCommand from '../../../src/cli/commands/add.mjs';

const executeAddCommand = async(db, ...keywords) => {
  const argv = await yargs(['add', ...keywords])
    .command({ ...addCommand, handler: vi.fn() }).argv;

  await addCommand.handler(argv, () => db);
};

vi.mock('../../../src/logger.mjs', async(importOriginal) => {
  const mod = await importOriginal();
  return {
    ...mod,
    log: vi.fn(),
    error: vi.fn(),
  };
});

test('add 搖曳露營', async() => {
  const db = await getMigratedDb(':memory:');

  await executeAddCommand(db, '搖曳露營');

  const s = (await getAllSubscriptions(db))[0];

  expect(s.title).toBe('搖曳露營');
  expect(s.keywords).includes('搖曳露營');
});

test('add 搖曳露營 喵萌 繁體', async() => {
  const db = await getMigratedDb(':memory:');

  await executeAddCommand(db, '搖曳露營', '喵萌', '繁體');

  const s = (await getAllSubscriptions(db))[0];

  expect(s.title).toBe('搖曳露營');
  expect(s.keywords)
    .includes('搖曳露營')
    .includes('喵萌')
    .includes('繁體');
});

test('add 搖曳露營 輕旅輕營 喵萌 繁體 --exclude-title', async() => {
  const db = await getMigratedDb(':memory:');

  await executeAddCommand(db, '搖曳露營', '輕旅輕營', '喵萌', '繁體', '--exclude-title');

  const s = (await getAllSubscriptions(db))[0];

  expect(s.title).toBe('搖曳露營');
  expect(s.keywords)
    .includes('輕旅輕營')
    .includes('喵萌')
    .includes('繁體')
    .not.includes('搖曳露營');
});

test('add 搖曳露營 喵萌 -x 简体', async() => {
  const db = await getMigratedDb(':memory:');

  await executeAddCommand(db, '搖曳露營', '喵萌', '-x', '简体');

  const s = (await getAllSubscriptions(db))[0];

  expect(s.title).toBe('搖曳露營');
  expect(s.keywords).includes('搖曳露營').includes('喵萌');
  expect(s.excludePattern.source).toMatchObject('(简体)');
});

// keyword after '-x' will view as an array
test('add 搖曳露營 喵萌 -x 简体 合集', async() => {
  const db = await getMigratedDb(':memory:');

  await executeAddCommand(db, '搖曳露營', '喵萌', '-x', '简体', '合集');

  const s = (await getAllSubscriptions(db))[0];

  expect(s.title).toBe('搖曳露營');
  expect(s.keywords).includes('搖曳露營').includes('喵萌');
  expect(s.excludePattern.source).toMatchObject('(简体|合集)');
});

// keyword is number
test('add 搖曳露營 喵萌 繁體 1080', async() => {
  const db = await getMigratedDb(':memory:');

  await executeAddCommand(db, '搖曳露營', '喵萌', '繁體', '1080');

  const s = (await getAllSubscriptions(db))[0];

  expect(s.title).toBe('搖曳露營');
  expect(s.keywords)
    .includes('搖曳露營')
    .includes('喵萌')
    .includes('繁體')
    .includes('1080');
});
