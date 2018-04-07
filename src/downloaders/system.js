const open = require('opn');
const { print, l10n } = require('../utils');

const thread = JSON.parse(process.argv[2]);
const config = JSON.parse(process.argv[3]);

print.debug('dmhy:downloaders:system:thread', thread);
print.debug('dmhy:downloaders:system:config', config);

open(thread.link).then(() => {
  print.success(l10n('DOWNLOADER_DL_SUCCESS', { title: thread.title }));
}).catch((error) => {
  print.error(l10n('DOWNLOADER_DL_FAILED', { title: thread.title }));
  print.error(l10n('DOWNLOADER_START_FAILED', { downloader: 'system' }), error);
});
