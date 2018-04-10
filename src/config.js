const path = require('path');
const fs = require('fs-extra');
const { CONST, l10n } = require('./utils');
const { systemDownloadsFolder, defaultConfigPath } = CONST;

const DEFAULTS = {
  'downloader': 'system',
  'aria2-jsonrpc': 'http://localhost:6800/jsonrpc/',
  'destination': systemDownloadsFolder,
  'webhook-url': 'http://localhost/',
};
const VALIDATORS = {
  'downloader': (downloader) => {
    const result = { ok: true, msg: '' };
    const downloaders = fs.readdirSync(`${__dirname}/downloaders`).map((d) => path.basename(d, '.js'));
    if (!(new Set(downloaders)).has(downloader)) {
      result.ok = false;
      result.msg = l10n('CMD_CFG_VALIDATORS_DOWNLOADER_ERR');
    }
    return result;
  },
  'destination': (destination) => {
    const result = { ok: true, msg: '' };
    if (!(fs.existsSync(destination))) {
      result.ok = false;
      result.msg = l10n('CMD_CFG_VALIDATORS_DESTINATION_ERR');
    }
    return result;
  },
};

/**
 * @class Config
 * @member {string} configpath
 * @member {Object} parameters
 */
class Config {
/**
 * Creates an instance of Config.
 * @param {any} options [{ configpath = defaultConfigPath }={}]
 * @memberof Config
 */
  constructor({ configpath = defaultConfigPath } = {}) {
    this.configpath = configpath;

    if (!fs.existsSync(this.configpath)) {
      fs.ensureFileSync(this.configpath);
      this.reset();
      this.save();
    }

    this.parameters = Object.assign({}, DEFAULTS, JSON.parse(fs.readFileSync(this.configpath, 'utf-8')));
  }

  /**
   * @memberof Config
   */
  save() {
    fs.writeFileSync(this.configpath, JSON.stringify(this.parameters));
  }

  /**
   * @param {string} key
   * @return {{key:string, value:string}} key-value
   * @memberof Config
   */
  get(key) {
    if (Config.isValidKey(key)) {
      return { key, value: this.parameters[key] };
    }
    return null;
  }

  /**
   * Set a parameter and sync(save) immediately
   * @param {string} key
   * @param {string} value
   * @return {{key:string, value:string}} key-value
   * @memberof Config
   */
  set(key, value) {
    if (Config.isValidKey(key)) {
      this.parameters[key] = value;
      this.save();
      return { key, value };
    }
    return null;
  }

  /**
   * Reset a key or all keys to DEFAULTS
   *
   * @param {?string} [key=null]
   * @memberof Config
   */
  reset(key = null) {
    if (Config.isValidKey(key)) {
      this.parameters[key] = DEFAULTS[key];
    } else {
      this.parameters = Object.assign({}, DEFAULTS);
    }
    this.save();
  }

  /**
   * @return {boolean} valid
   * @memberof Config
   */
  isValid() {
    return Object.keys(this.parameters).every((key) => {
      if (VALIDATORS[key]) {
        return VALIDATORS[key](key).ok;
      }
      return true;
    });
  }

  /**
   * @static
   * @param {string} key
   * @return {boolean} valid
   * @memberof Config
   */
  static isValidKey(key) {
    return key && Object.keys(DEFAULTS).includes(key);
  }
}

Config.DEFAULTS = DEFAULTS;
Config.VALIDATORS = VALIDATORS;

exports.Config = Config;
