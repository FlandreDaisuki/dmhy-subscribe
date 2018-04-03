#!/usr/bin/env node
const { l10n, consola } = require('..');
const yargs = require('yargs');

const argv = yargs
  .usage(l10n('MAIN_USAGE'))
  .command(require('./command/add'))
  .command(require('./command/remove'))
  .example('$0 update "喔喔喔喔喔"\n第二行\n第三行', '喔喔喔喔外面喔喔喔喔\nasd')
  .example('$0 xxx "喔喔喔喔喔"\n第二行', '喔喔喔喔外面喔喔喔喔\nasd\n第三行')
  .help('h')
  .alias('h', 'help')
  .alias('v', 'version')
  .epilog('https://github.com/FlandreDaisuki/dmhy-subscribe')
  .argv;

console.log(argv);
consola.success('success');
