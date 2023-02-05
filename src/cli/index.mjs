#!/usr/bin/env node

import path from 'path';
import { fileURLToPath } from 'url';
import yargs from 'yargs';

const loadCommand = async(name) => {
  const thisFileDir = path.dirname(fileURLToPath(import.meta.url));
  return import(path.join(thisFileDir, 'commands', `${name}.mjs`));
};

const argv = yargs(process.argv.slice(2))
  .command(await loadCommand('add'))
  .argv;

console.log(argv);
