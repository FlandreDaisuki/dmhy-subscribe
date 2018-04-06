#!/usr/bin/env node

const path = require('path');
const fs = require('fs-extra');
const axios = require('axios');
const yargs = require('yargs');
const semver = require('semver');
const { spawn } = require('child_process');
const { l10n, print, CONST, Database, fetchThreads } = require('..');

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

  // No command, update and download all
  if (!argv._.length) {
    const db = new Database();
    const allTask = db.subscriptions.map(async (sub) => {
      const remoteThreads = await fetchThreads(sub);
      return remoteThreads.map((rth) => {
        const found = sub.threads.find((th) => th.title === rth.title);
        if (!found) {
          sub.add(rth);
          db.save();
          if (!argv.x) {
            const downloader = db.config.get('downloader').value;
            const script = path.resolve(`${__dirname}/../src/downloaders/${downloader}.js`);
            const args = [rth, db.config.parameters].map(JSON.stringify);

            return new Promise((resolve, reject) => {
              const task = spawn('node', [script, ...args], {
                stdio: 'inherit',
              });
              task.on('close', (code) => {
                if (code === 0) resolve(code);
                else reject(code);
              });
              task.on('error', (error) => reject(error));
            });
          }
        }
      });
    });
    Promise.all(allTask).then(() => {
      if (argv.x) {
        print.success(l10n('MAIN_ALL_X_DONE'));
      } else {
        print.success(l10n('MAIN_ALL_DONE'));
      }
    });
  }
}


