const os = require('os');
const fs = require('fs-extra');
const crypto = require('crypto');
const { execSync, spawnSync } = require('child_process');
const pkg = require('../package.json');
const yaml = require('js-yaml');
const chalk = require('chalk');

const print = (() => {
  const _print = {
    log: console.log.bind(console, chalk.whiteBright('❯')),
    debug: console.debug.bind(console, chalk.magenta('🐛')),
    info: console.info.bind(console, chalk.blueBright('ℹ')),
    success: console.log.bind(console, chalk.green('✔')),
    error: console.error.bind(console, chalk.redBright('✖')),
    fatal: console.error.bind(console, chalk.redBright('✖')),
    warn: console.warn.bind(console, chalk.yellow('⚠')),
  };
  if (process.env.NODE_ENV === 'test') {
    for (const action of Object.keys(_print)) {
      _print[action] = () => {};
    }
  }
  if (!process.env.DEBUG) {
    _print.debug = () => {};
  }
  return _print;
})();


/**
 * Get hash that [A-Z]{3}
 * @param {string} str
 * @param {string} [seed='']
 * @return {string} hash
 */
function hash(str, seed = '') {
  const digest = crypto.createHash('sha1')
    .update(str + seed)
    .digest('hex');

  return Number(`0x${digest}`)
    .toString(36)
    .replace(/[^a-z]/g, '')
    .slice(-3)
    .toUpperCase();
}

/**
 * Flatten an array (recursively)
 * @param {any[]} array
 * @return {any[]} flattenedArray
 */
function flatten(array) {
  return array.reduce((newArr, item) => {
    if (Array.isArray(item)) {
      newArr = newArr.concat(flatten(item));
    } else {
      newArr.push(item);
    }
    return newArr;
  }, []);
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

  const unix = () => (env.LC_ALL || env.LC_MESSAGES || env.LANG || env.LANGUAGE || '').replace(/[.].*$/, '');


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
    darwin: unix,
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
        print.error(error);
      }
    }
    return prev;
  }, {});

  return (key, placeholder = {}) => {
    return Object.entries(placeholder).reduce((prev, cur) => {
      const pattern = cur[0].replace(/[$]/g, '[$]');
      return prev.replace(new RegExp(`%${pattern}%`, 'g'), cur[1]);
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
    for (const elem of subset) {
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
    const union = new XSet(this);
    for (const elem of iterable) {
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
    for (const elem of iterable) {
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
    const intersection = new XSet();
    for (const elem of iterable) {
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
    const difference = new XSet(this);
    for (const elem of iterable) {
      difference.delete(elem);
    }
    return difference;
  }
}

/**
 * @param {string} s
 * @return {?RegExp} result
 */
function strToRegexp(s) {
  if (/^\/.*\/\w*$/.test(s)) {
    const [, pattern, flag] = s.match(/^\/(.*)\/(\w*)$/);
    return new RegExp(pattern, flag);
  }
  return null;
}

/**
 * Split keywords and unkeywords
 *
 * @param {string} keywords
 * @return {{unkeywords:string[], keywords:string[]}}
 */
function splitKeywords(keywords) {
  const unkeywords = keywords
    .filter((keyword) => /^~.*~$/.test(keyword))
    .map((unkeyword) => unkeyword.replace(/^~(.*)~$/, '$1'));
  return {
    unkeywords,
    keywords: keywords.filter((keyword) => !/^~.*~$/.test(keyword)),
  };
}

/**
 * Download thread with downloader
 * @param {string} downloader
 * @param {Thread} thread
 * @param {Config} config
 * @return {Promise}
 */
function downloadThreadWithDownloader(downloader, thread, config) {
  const dl = require(`${__dirname}/downloaders/${downloader}`);

  return dl(thread, config).catch((error) => {
    print.error(l10n('DOWNLOADER_START_FAILED', { downloader }), error);
    return Promise.reject(error);
  });
}

const defaultProjectDataDir = (() => {
  if (process.env.NODE_ENV === 'development') {
    return `${os.homedir()}/.dmhy-subscribe-dev`;
  } else {
    return `${os.homedir()}/.dmhy-subscribe`;
  }
})();

module.exports = {
  print,
  hash,
  flatten,
  l10n,
  XSet,
  strToRegexp,
  splitKeywords,
  downloadThreadWithDownloader,
  CONST: {
    systemDownloadsFolder,
    systemLocale,
    defaultProjectDataDir,
    defaultDatabasePath: `${defaultProjectDataDir}/db.json`,
    defaultISubsDir: `${defaultProjectDataDir}/isubs`,
    defaultConfigPath: `${defaultProjectDataDir}/config.json`,
    defaultVersionPath: `${defaultProjectDataDir}/.version`,
    remoteVersionPath: `${defaultProjectDataDir}/.remoteVersion`,
    packageVersion: pkg.version,
  },
};
