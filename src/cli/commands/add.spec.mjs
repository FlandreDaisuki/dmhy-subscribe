// @ts-nocheck
import { afterEach, beforeEach, expect, test, vi } from 'vitest';
import yargs from 'yargs';
import { getAllSubscriptions, getMigratedDb } from '../../database.mjs';
import * as addCommand from './add.mjs';

beforeEach(() => {
  vi.stubGlobal('console', {
    log: vi.fn(),
    error: vi.fn(),
  });
});

afterEach(() => {
  vi.unstubAllGlobals();
});

test('add 搖曳露營', async() => {
  const argv = await yargs(['add', '搖曳露營'])
    .command({ ...addCommand, handler: vi.fn() }).argv;

  const db = await getMigratedDb(':memory:');

  await addCommand.handler(argv, () => db);
  const s = (await getAllSubscriptions(db))[0];

  expect(s.title).toBe('搖曳露營');
  expect(s.keywords).includes('搖曳露營');
});

test('add 搖曳露營 喵萌 繁體', async() => {
  const argv = await yargs(['add', '搖曳露營', '喵萌', '繁體'])
    .command({ ...addCommand, handler: vi.fn() }).argv;

  const db = await getMigratedDb(':memory:');

  await addCommand.handler(argv, () => db);
  const s = (await getAllSubscriptions(db))[0];

  expect(s.title).toBe('搖曳露營');
  expect(s.keywords)
    .includes('搖曳露營')
    .includes('喵萌')
    .includes('繁體');
});

test('add 搖曳露營 輕旅輕營 喵萌 繁體 --exclude-title', async() => {
  const argv = await yargs(['add', '搖曳露營', '輕旅輕營', '喵萌', '繁體', '--exclude-title'])
    .command({ ...addCommand, handler: vi.fn() }).argv;

  const db = await getMigratedDb(':memory:');

  await addCommand.handler(argv, () => db);
  const s = (await getAllSubscriptions(db))[0];

  expect(s.title).toBe('搖曳露營');
  expect(s.keywords)
    .includes('輕旅輕營')
    .includes('喵萌')
    .includes('繁體')
    .not.includes('搖曳露營');
});

test('add 搖曳露營 喵萌 -x 简体', async() => {
  const argv = await yargs(['add', '搖曳露營', '喵萌', '-x', '简体'])
    .command({ ...addCommand, handler: vi.fn() }).argv;

  const db = await getMigratedDb(':memory:');

  await addCommand.handler(argv, () => db);
  const s = (await getAllSubscriptions(db))[0];

  expect(s.title).toBe('搖曳露營');
  expect(s.keywords).includes('搖曳露營').includes('喵萌');
  expect(s.excludePattern.source).toMatchObject('(简体)');
});

// keyword after '-x' will view as an array
test('add 搖曳露營 喵萌 -x 简体 合集', async() => {
  const argv = await yargs(['add', '搖曳露營', '喵萌', '-x', '简体', '合集'])
    .command({ ...addCommand, handler: vi.fn() }).argv;

  const db = await getMigratedDb(':memory:');

  await addCommand.handler(argv, () => db);
  const s = (await getAllSubscriptions(db))[0];

  expect(s.title).toBe('搖曳露營');
  expect(s.keywords).includes('搖曳露營').includes('喵萌');
  expect(s.excludePattern.source).toMatchObject('(简体|合集)');
});

// keyword is number
test('add 搖曳露營 喵萌 繁體 1080', async() => {
  const argv = await yargs(['add', '搖曳露營', '喵萌', '繁體', '1080'])
    .command({ ...addCommand, handler: vi.fn() }).argv;

  const db = await getMigratedDb(':memory:');

  await addCommand.handler(argv, () => db);
  const s = (await getAllSubscriptions(db))[0];

  expect(s.title).toBe('搖曳露營');
  expect(s.keywords)
    .includes('搖曳露營')
    .includes('喵萌')
    .includes('繁體')
    .includes('1080');
});
