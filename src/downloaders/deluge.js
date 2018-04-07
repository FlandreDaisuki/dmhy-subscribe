const { spawn } = require('child_process');
const { print, l10n } = require('../utils');

const thread = JSON.parse(process.argv[2]);
const config = JSON.parse(process.argv[3]);

print.debug('dmhy:downloaders:deluge:thread', thread);
print.debug('dmhy:downloaders:deluge:config', config);

const task = spawn('deluge-console', ['add', thread.link]);
print.debug(`start deluge-console on pid ${task.pid}`);

task.on('close', (code) => {
  if (code === 0) {
    print.success(l10n('DOWNLOADER_DL_SUCCESS', { title: thread.title }));
  } else {
    print.error(l10n('DOWNLOADER_DL_FAILED', { title: thread.title }));
  }
});
task.on('error', (error) => {
  print.error(l10n('DOWNLOADER_START_FAILED', { downloader: 'deluge' }), error);
});
