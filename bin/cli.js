#!/usr/bin/env node

const path = require('path');
const fs = require('fs-extra');
const fetch = require('node-fetch');
const yargs = require('yargs');
const semver = require('semver');
const { downloadThreadWithDownloader } = require('..');
const { l10n, print, CONST, Database, fetchThreads } = require('..');

// fetch remote version every 15 times
(async() => {
  const REFETCH_TIMES = 15;
  if (fs.existsSync(CONST.remoteVersionPath)) {
    const remoteVersion = fs.readJSONSync(CONST.remoteVersionPath, 'utf-8');
    const { version: lastRemoteVersion } = remoteVersion;
    let { count } = remoteVersion;
    if (count > REFETCH_TIMES) {
      const data = await fetch('https://registry.npmjs.org/dmhy-subscribe').then((resp) => resp.json());
      const remoteVersion = data['dist-tags'].latest;
      count = 0;
      if (semver.gt(remoteVersion, CONST.packageVersion) || semver.gt(remoteVersion, lastRemoteVersion)) {
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
async function main() {
  const command = fs.readdirSync(`${__dirname}/command`)
    .map((cmdpath) => path.basename(cmdpath, '.js'))
    .reduce((prev, cur) => {
      prev[cur] = require(`./command/${cur}`);
      return prev;
    }, {});

  const supportCommands = Object.entries(command).reduce((collect, [key, mod]) => {
    return collect.concat(key).concat(mod.aliases);
  }, []);

  const argv = yargs
    .parserConfiguration({
      yargs: {
        'short-option-groups': false,
      },
    })
    .usage(l10n('MAIN_USAGE'))
    .command(command.add)
    .command(command.list)
    .command(command.remove)
    .command(command.search)
    .command(command.config)
    .command(command.download)
    .option('x', {
      alias: 'no-dl',
      describe: l10n('MAIN_OPT_X'),
      type: 'boolean',
      global: false,
    })
    .example('dmhy add "搖曳露營,喵萌,繁體"\ndmhy', l10n('MAIN_EXAMPLE1_DESC'))
    .help('h')
    .alias('h', 'help')
    .alias('v', 'version')
    .argv;

  // No command, update and download all
  if (!argv._.length) {
    const db = new Database();
    const downloader = db.config.get('downloader').value;

    const allDownloadTasks = [];
    for (const sub of db.subscriptions) {
      const remoteThreads = await fetchThreads(sub);
      for (const rth of remoteThreads) {
        const found = sub.threads.find((th) => th.title === rth.title);
        if (!found) {
          sub.add(rth);
          if (!argv.x) {
            allDownloadTasks.push(downloadThreadWithDownloader(downloader, rth, db.config.parameters));
          }
        }
      }
    }

    try {
      await Promise.all(allDownloadTasks);
      if (argv.x) {
        print.success(l10n('MAIN_ALL_X_DONE'));
      } else {
        print.success(l10n('MAIN_ALL_DONE'));
      }
      db.save();
    } catch {
      // Error will print by downloaders, keep quiet
    }
  } else if (argv._.length > 1 || !supportCommands.includes(argv._[0])) {
    // Unknown command
    yargs.showHelp();
  }
}
