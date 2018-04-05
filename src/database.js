const fs = require('fs-extra');
const yaml = require('js-yaml');
const { CONST } = require('./utils');
const { Config } = require('./config');
const { Subscription } = require('./dmhy/subscription');

const { defaultDatabasePath, defaultISubsDir } = CONST;

// isub   資料庫自存的 Supscriptions 紀錄，作為初始化用，與訂閱用的不同
// dbpath 存 SID 與 Threads 的 Map
// sub    subscription 的縮寫

/**
 * @class Database
 * @member {string} dbpath
 * @member {string} isubsDir
 * @member {Config} config
 * @member {Subscription[]} subscriptions
 */
class Database {
  /**
   * Creates an instance of Database.
   * @param {any} options [{ dbpath = defaultDatabasePath, isubsDir = defaultISubsDir, config = new Config() }={}]
   * @memberof Database
   */
  constructor({ dbpath = defaultDatabasePath, isubsDir = defaultISubsDir, config = new Config() } = {}) {
    this.dbpath = dbpath;
    if (!fs.existsSync(this.dbpath)) {
      const empty = { };
      fs.writeFileSync(this.dbpath, JSON.stringify(empty));
    }

    this.isubsDir = isubsDir;
    if (!fs.existsSync(isubsDir)) {
      fs.mkdirSync(isubsDir);
    }

    this.config = config;
    if (!(config instanceof Config)) {
      throw new Error(`Bad config`);
    }

    const threadsMap = JSON.parse(fs.readFileSync(this.dbpath, 'utf-8'));
    const isubs = fs.readdirSync(this.isubsDir);
    this.subscriptions = isubs.map((isub) => new Subscription(`${this.isubsDir}/${isub}`));
    this.subscriptions.forEach((sub) => {
      sub.loadThreads(threadsMap[sub.sid]);
    });
  }

  /**
   * @param {Subscription} sub
   * @return {boolean} success
   * @memberof Database
   */
  add(sub) {
    if (!(sub instanceof Subscription)) {
      throw new TypeError('Parameter should be a Subscription.');
    }
    sub.generateSid(this.subscriptions.map((s) => s.sid));
    this.subscriptions.push(sub);
    return true;
  }

  /**
   * @param {string} sid
   * @return {boolean} success
   * @memberof Database
   */
  remove(sid) {
    const index = this.subscriptions.findIndex((sub) => {
      return sub.sid === sid;
    });
    if (index >= 0) {
      this.subscriptions.splice(index, 1);
      return true;
    }
    return false;
  }

  /**
   * @memberof Database
   */
  save() {
    const threadsMap = this.subscriptions.reduce((prev, sub) => {
      prev[sub.sid] = sub.threads;
      return prev;
    }, {});
    fs.writeFileSync(this.dbpath, JSON.stringify(threadsMap));

    this.subscriptions.forEach((sub) => {
      let { sid, title, keywords, episodeParser, userBlacklistPatterns } = sub;
      if (episodeParser) {
        episodeParser = episodeParser.toString();
      }
      userBlacklistPatterns = userBlacklistPatterns.map((ubp) => ubp.toString());
      const yamlData = yaml.safeDump({ sid, title, keywords, episodeParser, userBlacklistPatterns });
      fs.writeFileSync(`${this.isubsDir}/${sid}.yml`, yamlData);
    });
  }

  /**
   * @param {string} sid
   * @return {?Subscription} Subscription
   * @memberof Database
   */
  find(sid) {
    return this.subscriptions.find((sub) => sub.sid === sid) || null;
  }

  /**
   * @memberof Database
   */
  sort() {
    this.subscriptions.forEach((sub) => sub.sort());
    this.subscriptions.sort((a, b) => b.latest - a.latest);
  }
}

exports.Database = Database;
