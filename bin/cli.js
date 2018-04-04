#!/usr/bin/env node

const { l10n, print, CONST } = require('..');
const fs = require('fs');
const axios = require('axios');
const semver = require('semver');
const yargs = require('yargs');

(async () => {
  const { data } = await axios.get('https://registry.npmjs.org/dmhy-subscribe');
  const remoteVersion = data['dist-tags'].latest;
  if (fs.existsSync(CONST.remoteVersionPath)) {
    const lastRemoteVersion = fs.readFileSync(CONST.remoteVersionPath, 'utf-8');
    if (semver.gt(remoteVersion, CONST.packageVersion) && semver.gt(remoteVersion, lastRemoteVersion)) {
      console.log();
      print.info(l10n('NEW_VERSION_MSG'));
      console.log();
    }
  }
  fs.writeFileSync(CONST.remoteVersionPath, remoteVersion);
  main();
})();

/**
 * Entry point
 */
function main() {
  const argv = yargs
    .usage(l10n('MAIN_USAGE'))
    .command(require('./command/add'))
    .command(require('./command/remove'))
    .command(require('./command/list'))
    .command(require('./command/download'))
    .command(require('./command/search'))
    .command(require('./command/config'))
    .option('x', {
      alias: 'no-dl',
      describe: l10n('MAIN_OPT_X'),
      type: 'boolean',
      global: false,
    })
    // .example('$0 update "喔喔喔喔喔"\n第二行\n第三行', '喔喔喔喔外面喔喔喔喔\nasd')
    // .example('$0 xxx "喔喔喔喔喔"\n第二行', '喔喔喔喔外面喔喔喔喔\nasd\n第三行')
    .help('h')
    .alias('h', 'help')
    .alias('v', 'version')
    .argv;

  console.log(argv);
  print.success('success');
}


