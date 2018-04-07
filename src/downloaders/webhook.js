const axios = require('axios');
const { print, l10n } = require('../..');

module.exports = (thread, config) => {
  print.debug('dmhy:downloaders:webhook:thread', thread);
  print.debug('dmhy:downloaders:webhook:config', config);

  return axios
    .post(config['webhook-url'], thread)
    .then(() => print.success(l10n('DOWNLOADER_DL_SUCCESS', { title: thread.title })))
    .catch(() => print.error(l10n('DOWNLOADER_DL_FAILED', { title: thread.title })));
};
