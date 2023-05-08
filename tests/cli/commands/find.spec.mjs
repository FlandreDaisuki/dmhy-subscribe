// @ts-nocheck
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { afterEach, expect, test, vi } from 'vitest';
import yargs from 'yargs';
import RSSParser from 'rss-parser';

import * as findCommand from '../../../src/cli/commands/find.mjs';

const thisFileDir = path.dirname(fileURLToPath(import.meta.url));

const campRss = await fs.readFile(path.join(thisFileDir, '../../fixtures/camp.xml'), 'utf8');

const outputs = [];

const executeFindCommand = async(...keywords) => {
  const argv = await yargs(['find', ...keywords])
    .command({ ...findCommand, handler: vi.fn() }).argv;

  await findCommand.handler(argv);
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

test('find 搖曳露營 喵萌', async() => {
  await executeFindCommand('搖曳露營', '喵萌');
});

test('find 搖曳露營 喵萌 -x 合集', async() => {
  await executeFindCommand('搖曳露營', '喵萌', '-x', '合集');
  expect(outputs.map(String).every((line) => !line.includes('合集'))).toBe(true);
});
