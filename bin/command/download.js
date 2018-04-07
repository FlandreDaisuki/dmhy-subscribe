const path = require('path');
const { spawn } = require('child_process');
const { l10n, print, Database } = require('../..');

exports.command = 'download <THID...>';

exports.aliases = ['dl'];

exports.desc = l10n('CMD_DL_DESC');

exports.builder = (yargs) => {
  yargs
    .usage(l10n('CMD_DL_USAGE'))
    .example('$0 dl AAA', l10n('CMD_DL_EXAMPLE1_DESC', { $0: yargs.$0 }))
    .example('$0 dl AAA-1,4,9', l10n('CMD_DL_EXAMPLE2_DESC'))
    .example('$0 dl AAA-OVA1..3', l10n('CMD_DL_EXAMPLE3_DESC'));
};

exports.handler = (argv) => {
  const db = new Database();

  const allTasks = argv.THID.map((thid) => {
    const [sid, epstr] = thid.split('-');
    const found = db.find({ sid });

    if (found) {
      const threads = found.getThreads(epstr);
      print.debug('threads', threads);
      return threads.map((th) => {
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

  Promise.all(allTasks)
    .then(() => {
      process.exit(0);
    }).catch((error) => {
      print.error(error);
      process.exit(1);
    });
};
