const { l10n, print, Database, downloadThreadWithDownloader } = require('../..');

exports.command = 'download <THID...>';

exports.aliases = ['dl'];

exports.desc = l10n('CMD_DL_DESC');

exports.builder = (yargs) => {
  yargs
    .usage(l10n('CMD_DL_USAGE'))
    .example('dmhy dl AAA', l10n('CMD_DL_EXAMPLE1_DESC'))
    .example('dmhy dl AAA-1,4,9', l10n('CMD_DL_EXAMPLE2_DESC'))
    .example('dmhy dl AAA-OVA1..3', l10n('CMD_DL_EXAMPLE3_DESC'));
};

exports.handler = (argv) => {
  const db = new Database();

  const allTasks = argv.THID.map((thid) => {
    const [sid, epstr] = thid.split('-');
    const found = db.find({ sid });

    if (found) {
      const threads = found.getThreads(epstr);
      print.debug('threads', threads);
      const allThreadTasks = Promise.all(threads.map((th) => {
        const downloader = db.config.get('downloader').value;
        return downloadThreadWithDownloader(downloader, th, db.config.parameters);
      }));

      // flatten promise for outer Pormise.all
      return new Promise((resolve, reject) => {
        allThreadTasks.then(resolve).catch(reject);
      });
    } else {
      print.error(l10n('CMD_DL_SID_NOT_FOUND', { sid }));
    }
  });

  Promise.all(allTasks)
    .then(() => {
      process.exit(0);
    })
    .catch(() => {
      // Error will print by downloaders, keep quiet
      process.exit(1);
    });
};
