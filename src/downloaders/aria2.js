const Aria2 = require('aria2');
const { URL } = require('url');
const { print, l10n } = require('../utils');

module.exports = (thread, config) => {
  print.debug('dmhy:downloaders:aria2:thread', thread);
  print.debug('dmhy:downloaders:aria2:config', config);

  let u;
  try {
    u = new URL(config['aria2-jsonrpc']);
  } catch (e) {
    print.error(`Invalid URL: ${config['aria2-jsonrpc']}`);
    return Promise.resolve();
  }
  const verify = [
    [!u.hostname, 'You must provide hostname'],
    [u.username && u.username !== 'token', 'Only secret is supported!'],
    [u.username && !u.password, 'You must provide a secret'],
  ];
  for (const [cond, msg] of verify) {
    if (cond) {
      print.error(msg);
      return Promise.resolve();
    }
  }
  const client = new Aria2({
    host: u.hostname,
    port: u.port || 6800,
    secure: false,
    secret: u.password,
    path: u.pathname,
  });
  client.onerror = (err) => {
    print.error('aria2 connect error:', err);
  };
  const opts = {};
  if (config.destination) {
    opts.dir = config.destination;
  }
  return client
    .open()
    .then(() => client.addUri([thread.link], opts))
    .then(() => print.success(l10n('DOWNLOADER_DL_SUCCESS', { title: thread.title })))
    .catch(() => print.error(l10n('DOWNLOADER_DL_FAILED', { title: thread.title })))
    .then(() => client.close()); // finally
};
