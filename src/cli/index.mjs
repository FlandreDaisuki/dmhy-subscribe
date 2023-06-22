#!/usr/bin/env node

import path from 'path';
import { fileURLToPath } from 'url';
import yargs from 'yargs';
import debug from 'debug';

/** @param {string} name */
const loadCommand = async (name) => {
  const thisFileDir = path.dirname(fileURLToPath(import.meta.url));
  return import(path.join(thisFileDir, 'commands', `${name}.mjs`));
};

debug('dmhy:cli:process.argv')(process.argv);

const argv = await yargs(process.argv.slice(2))
  .command(await loadCommand('add'))
  .command(await loadCommand('find'))
  .command(await loadCommand('pull'))
  .command(await loadCommand('list'))
  .command(await loadCommand('config'))
  .command(await loadCommand('remove'))
  .command(await loadCommand('download'))
  .help('h')
  .alias('h', 'help')
  .alias('v', 'version')
  .demandCommand()
  .argv;

debug('dmhy:cli:argv')(argv);
