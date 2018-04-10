const open = require('opn');
const { print, l10n } = require('../utils');

module.exports = (thread, config) => {
  print.debug('dmhy:downloaders:system:thread', thread);
  print.debug('dmhy:downloaders:system:config', config);

  return open(thread.link).then(() => {
    print.success(l10n('DOWNLOADER_DL_SUCCESS', { title: thread.title }));
  }).catch((error) => {
    print.error(l10n('DOWNLOADER_DL_FAILED', { title: thread.title }));
    return Promise.reject(error);
  });
};
