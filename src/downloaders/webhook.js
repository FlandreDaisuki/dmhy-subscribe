const axios = require('axios');
const { print, l10n } = require('../..');

const thread = JSON.parse(process.argv[2]);
const config = JSON.parse(process.argv[3]);

print.debug('dmhy:downloaders:webhook:thread', thread);
print.debug('dmhy:downloaders:webhook:config', config);

axios
  .post(config['webhook-url'], thread)
  .then(() => print.success(l10n('DOWNLOADER_DL_SUCCESS', { title: thread.title })))
  .catch(() => print.error(l10n('DOWNLOADER_DL_FAILED', { title: thread.title })));
