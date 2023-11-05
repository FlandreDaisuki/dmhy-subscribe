import { afterEach, assert, expect, it, vi } from 'vitest';
import yargs from 'yargs';

import {
  getAllSubscriptions,
  getMigratedDb,
  isExistingSubscriptionSid,
} from '../../../src/database.mjs';
import { t } from '../../../src/locale.mjs';

import * as addCommand from '../../../src/cli/commands/add.mjs';
import * as removeCommand from '../../../src/cli/commands/remove.mjs';

const outputs = [];
const errOutputs = [];

const executeAddCommand = async (db, ...keywords) => {
  const argv = await yargs(['add', ...keywords])
    .command({ ...addCommand, handler: vi.fn() }).argv;

  await addCommand.handler(argv, () => db);
};

const executeRemoveCommand = async (db, ...sids) => {
  const argv = await yargs(['rm', ...sids])
    .command({ ...removeCommand, handler: vi.fn() }).argv;

  await removeCommand.handler(argv, () => db);
};

vi.mock('../../../src/logger.mjs', async (importOriginal) => {
  const mod = await importOriginal();
  return {
    ...mod,
    log: vi.fn((...args) => outputs.push(args.join(' '))),
    error: vi.fn(() => (...args) => errOutputs.push(args.join(' '))),
  };
});

vi.mock('../../../src/utils.mjs', async (importOriginal) => {
  const mod = await importOriginal();
  return {
    ...mod,
    ask: vi.fn(() => 'yes'),
  };
});

afterEach(() => {
  outputs.length = 0;
  errOutputs.length = 0;
});

it('remove existing one', async () => {
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

  await executeRemoveCommand(db, sidMap['搖曳露營']);

  expect(await isExistingSubscriptionSid(sidMap['搖曳露營'], db)).toBe(false);
  expect(await isExistingSubscriptionSid(sidMap['孤獨搖滾'], db)).toBe(true);
  expect(outputs).include(t('CMD_RM_SUCCESS', { title: '搖曳露營' }));
});

it('remove non existing one', async () => {
  const db = await getMigratedDb(':memory:');

  await executeRemoveCommand(db, 'XYZ');

  expect(errOutputs).include(t('CMD_RM_SID_NOT_FOUND', { sid: 'XYZ' }));
});
