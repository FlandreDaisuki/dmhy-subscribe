#!/usr/bin/env node

import path from 'path';
import { fileURLToPath } from 'url';
import yargs from 'yargs';
import debug from 'debug';

const d = debug('dmhy:cli');

const loadCommand = async(name) => {
  const thisFileDir = path.dirname(fileURLToPath(import.meta.url));
  return import(path.join(thisFileDir, 'commands', `${name}.mjs`));
};

d('process.argv:', process.argv);

const argv = yargs(process.argv.slice(2))
  .command(await loadCommand('add'))
  .command(await loadCommand('find'))
  .argv;

d(argv);
