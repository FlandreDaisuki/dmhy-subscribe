const fetch = require('node-fetch');
const { print, l10n } = require('../..');
const url = require('url');

module.exports = async (thread, config) => {
  print.debug('dmhy:downloaders:qbittorrent:thread', thread);
  print.debug('dmhy:downloaders:qbittorrent:config', config);

  try {
    await fetch(config['qbittorrent-url']);
  } catch (e) {
    print.error(l10n('QBITTORRENT_WEBUI_NOT_AVAILABLE'));
    print.error(l10n('DOWNLOADER_DL_FAILED', { title: thread.title }));
    return;
  }
  const [username, password] = config['qbittorrent-auth'].split(':');
  const loginParams = new URLSearchParams();
  loginParams.append('username', username);
  loginParams.append('password', password);
  const loginResponse = await fetch(url.resolve(config['qbittorrent-url'], '/login'), {
    method: 'POST',
    body: loginParams.toString(),
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  });
  const setCookie = loginResponse.headers.get('set-cookie');
  if (!setCookie) {
    print.error(l10n('QBITTORRENT_LOGIN_FAILED'));
    print.error(l10n('DOWNLOADER_DL_FAILED', { title: thread.title }));
    return;
  }
  const sid = setCookie.split(' ')[0]; // Get the first part "SID=xxxx;"
  const downloadParams = new URLSearchParams();
  downloadParams.append('urls', thread.link);
  downloadParams.append('savepath', config['destination']);
  const downloadResponse = await fetch(url.resolve(config['qbittorrent-url'], '/command/download'), {
    method: 'POST',
    headers: {
      'Cookie': sid,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: downloadParams.toString(),
  });
  if ((await downloadResponse.text()) === 'Ok.') {
    print.success(l10n('DOWNLOADER_DL_SUCCESS', { title: thread.title }));
  } else {
    print.error(l10n('DOWNLOADER_DL_FAILED', { title: thread.title }));
  }
};
