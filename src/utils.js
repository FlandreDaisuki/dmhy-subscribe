const os = require('os');
const fs = require('fs');
const { execSync, spawnSync } = require('child_process');
const pkg = require('../package.json');
const yaml = require('js-yaml');
const consola = require('consola');

/**
 * Get hash that [A-Z]{3}
 * @param {string} str
 * @param {string} [seed='']
 * @return {string} hash
 */
function hash(str, seed = '') {
  return Buffer.from(str + seed).toString('base64')
    .replace(/[\W\d]/g, '')
    .toUpperCase()
    .slice(-3)
    .split('')
    .reverse()
    .join('');
}

// Modified from https://github.com/juliangruber/downloads-folder
const systemDownloadsFolder = (() => {
  const darwin = () => {
    return `${process.env.HOME}/Downloads`;
  };

  const windows = () => {
    return `${process.env.USERPROFILE}/Downloads`;
  };

  const unix = () => {
    let dir;
    try {
      dir = execSync('xdg-user-dir DOWNLOAD', { encoding: 'utf-8', stdio: ['ignore', 'pipe', 'ignore'] });
    } catch (_) {/**/}
    if (dir) return dir.trim();

    let stat;
    const homeDownloads = `${process.env.HOME}/Downloads`;
    try {
      stat = fs.statSync(homeDownloads);
    } catch (_) {/**/}
    if (stat) return homeDownloads;

    return '/tmp';
  };

  return {
    darwin: darwin,
    freebsd: unix,
    linux: unix,
    sunos: unix,
    win32: windows,
  }[os.platform()]();
})();

// Modified from https://github.com/sindresorhus/os-locale
const systemLocale = ((env) => {
  const LOCALEID = {
    // https://zh.wikipedia.org/wiki/地區設定
    '0804': 'zh_CN',
    '20804': 'zh_CN',
    '0404': 'zh_TW',
    '30404': 'zh_TW',
    '0C04': 'zh_HK',
  };

  const unix = () => (env.LC_ALL || env.LC_MESSAGES || env.LANG || env.LANGUAGE).replace(/[.].*$/, '');


  const windows = () => {
    const x = spawnSync('wmic', ['os', 'get', 'locale'], { encoding: 'utf-8' });
    if (x.status === 0) {
      const lcid = x.stdout.replace('Locale', '').trim();
      return LOCALEID[lcid];
    }
    return '';
  };

  const localeName = {
    freebsd: unix,
    linux: unix,
    sunos: unix,
    win32: windows,
  }[os.platform()]() || 'en_US';

  const [lang, territory] = localeName.split('_');

  return { lang, territory };
})(process.env);

const l10n = (() => {
  const candidates = [
    `${__dirname}/locales/en.yml`,
    `${__dirname}/locales/${systemLocale.lang}.yml`,
    `${__dirname}/locales/${systemLocale.lang}_${systemLocale.territory}.yml`,
  ];

  const dict = candidates.reduce((prev, cur) => {
    if (fs.existsSync(cur)) {
      try {
        const localeStrings = yaml.safeLoad(fs.readFileSync(cur, 'utf-8'));
        return Object.assign(prev, localeStrings);
      } catch (error) {
        consola.error(error);
      }
    }
    return prev;
  }, {});

  return (key, placeholder = {}) => {
    return Object.entries(placeholder).reduce((prev, cur) => {
      return prev.replace(`%${cur[0]}%`, cur[1]);
    }, dict[key]);
  };
})();

// Modified from https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Set#Examples
/**
 * The set includes more useful functions
 *
 * @class XSet
 * @extends {Set}
 */
class XSet extends Set {
  /**
   * Check this is a superset of subset
   *
   * @param {Iterable.<*>} subset
   * @return {boolean} answer
   * @memberof XSet
   */
  isSuperset(subset) {
    for (let elem of subset) {
      if (!this.has(elem)) {
        return false;
      }
    }
    return true;
  }

  /**
   * Return a new union set
   *
   * @param {Iterable.<*>} iterable
   * @return {XSet} union
   * @memberof XSet
   */
  union(iterable) {
    let union = new XSet(this);
    for (let elem of iterable) {
      union.add(elem);
    }
    return union;
  }

  /**
   * Union with a subset
   *
   * @param {Iterable.<*>} iterable
   * @memberof XSet
   */
  unionWith(iterable) {
    for (let elem of iterable) {
      this.add(elem);
    }
  }

  /**
   * Return a new intersection set
   *
   * @param {Iterable.<*>} iterable
   * @return {XSet} intersection
   * @memberof XSet
   */
  intersection(iterable) {
    let intersection = new XSet();
    for (let elem of iterable) {
      if (this.has(elem)) {
        intersection.add(elem);
      }
    }
    return intersection;
  }

  /**
   * Return a new difference set
   *
   * @param {Iterable.<*>} iterable
   * @return  {XSet} difference
   * @memberof XSet
   */
  difference(iterable) {
    let difference = new XSet(this);
    for (let elem of iterable) {
      difference.delete(elem);
    }
    return difference;
  }
}

module.exports = {
  consola,
  hash,
  l10n,
  XSet,
  CONST: {
    systemDownloadsFolder,
    systemLocale,
    defaultProjectDataDir: `${os.homedir()}/.dmhy-subscribe`,
    defaultDatabasePath: `${os.homedir()}/.dmhy-subscribe/fakedb.json`,
    defaultConfigPath: `${os.homedir()}/.dmhy-subscribe/config.json`,
    defaultVersionPath: `${os.homedir()}/.dmhy-subscribe/.version`,
    packageVersion: pkg.version,
  },
};
