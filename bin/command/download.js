const path = require('path');
const { spawn } = require('child_process');
const { l10n, print, Database } = require('../..');

exports.command = 'download <THID...>';

exports.aliases = ['dl'];

exports.desc = l10n('CMD_DL_DESC');

exports.builder = (yargs) => {
  yargs
    .usage(l10n('CMD_DL_USAGE'));
};

exports.handler = (argv) => {
  const db = new Database();

  argv.THID.forEach((thid) => {
    const [sid, epstr] = thid.split('-');
    const found = db.find({ sid });
    if (found) {
      const threads = found.getThreads(epstr);
      print.debug('threads', threads);
      threads.forEach((th) => {
        const downloader = db.config.get('downloader').value;
        const script = path.resolve(`${__dirname}/../../src/downloaders/${downloader}.js`);
        const args = [th, db.config.parameters].map(JSON.stringify);

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
      });
    } else {
      print.error(l10n('CMD_DL_SID_NOT_FOUND', { sid }));
    }
  });
  process.exit(0);
};
