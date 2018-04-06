#!/usr/bin/env node

const { l10n, print, CONST } = require('..');
const fs = require('fs-extra');
const axios = require('axios');
const semver = require('semver');
const yargs = require('yargs');

// fetch remote version every 15 times
(async () => {
  const REFETCH_TIMES = 15;
  if (fs.existsSync(CONST.remoteVersionPath)) {
    let { count, version: lastRemoteVersion } = fs.readJSONSync(CONST.remoteVersionPath, 'utf-8');
    if (count > REFETCH_TIMES) {
      const { data } = await axios.get('https://registry.npmjs.org/dmhy-subscribe');
      const remoteVersion = data['dist-tags'].latest;
      count = 0;
      if (semver.gt(remoteVersion, CONST.packageVersion) && semver.gt(remoteVersion, lastRemoteVersion)) {
        console.log();
        print.info(l10n('NEW_VERSION_MSG'));
        console.log();
      }
      fs.writeJSONSync(CONST.remoteVersionPath, { count: count, version: remoteVersion });
    } else {
      fs.writeJSONSync(CONST.remoteVersionPath, { count: count + 1, version: lastRemoteVersion });
    }
  } else {
    fs.writeJSONSync(CONST.remoteVersionPath, { count: 0, version: CONST.packageVersion });
  }
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
    .help('h')
    .alias('h', 'help')
    .alias('v', 'version')
    .argv;

  print.debug(JSON.stringify(argv, null, 2));

  // No command, update and download all
  if (!argv._.length) {
    print.success('success');
  }
}


