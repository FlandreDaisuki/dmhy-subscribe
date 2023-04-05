// @ts-nocheck

import os from 'os';
import fs from 'fs/promises';
import { execSync, spawnSync } from 'child_process';
import debug from 'debug';

// Modified from https://github.com/sindresorhus/os-locale
export const LOCALE = ((env) => {
  const LOCALE_ID = {
    // https://zh.wikipedia.org/wiki/地區設定
    '0804': 'zh_CN',
    '20804': 'zh_CN',
    '0404': 'zh_TW',
    '30404': 'zh_TW',
    '0C04': 'zh_HK',
  };

  const unix = () => (env.LC_ALL || env.LC_MESSAGES || env.LANG || env.LANGUAGE || '').replace(/[.].*$/, '');

  const windows = () => {
    const x = spawnSync('wmic', ['os', 'get', 'locale'], { encoding: 'utf-8' });
    if (x.status === 0) {
      const winLocId = x.stdout.replace('Locale', '').trim();
      return LOCALE_ID[winLocId];
    }
    return '';
  };

  const localeName = {
    freebsd: unix,
    linux: unix,
    sunos: unix,
    darwin: unix,
    win32: windows,
  }[os.platform()]() || 'en_US';

  const [lang, territory] = localeName.split('_');

  return { lang, territory };
})(process.env);

// Modified from https://github.com/juliangruber/downloads-folder
export const DOWNLOAD_DIR = process.env.DOWNLOAD_DIR ?? await(async() => {
  const darwin = () => {
    return `${os.homedir()}/Downloads`;
  };

  const windows = () => {
    return `${process.env.USERPROFILE}/Downloads`;
  };

  const unix = async() => {
    try {
      const xdgDownloadDir = execSync('xdg-user-dir DOWNLOAD', {
        encoding: 'utf-8', stdio: ['ignore', 'pipe', 'ignore'],
      }).trim();
      if ((await fs.stat(xdgDownloadDir)).isDirectory()) { return xdgDownloadDir; }
    } catch (err){
      debug('dmhy:env:xdgDownloadDir')(err);
    }

    try {
      const homeDownloadDir = `${os.homedir()}/Downloads`;
      if ((await fs.stat(homeDownloadDir)).isDirectory()) { return homeDownloadDir; }
    } catch (err) {
      debug('dmhy:env:homeDownloadDir')(err);
    }

    return '/tmp';
  };

  return await {
    darwin,
    freebsd: unix,
    linux: unix,
    sunos: unix,
    win32: windows,
  }[os.platform()]();
})();

export const DATABASE_DIR = process.env.DATABASE_DIR ?? await (async() => {
  const dir = `${os.homedir()}/.local/share/dmhy-subscribe`;
  await fs.mkdir(dir, { recursive: true });
  return dir;
})();
