const path = require('path');
const fs = require('fs-extra');
const { spawn } = require('child_process');
const yaml = require('js-yaml');
const { CONST, print } = require('./utils');
const { Config } = require('./config');
const { Subscription } = require('./dmhy/subscription');

const { defaultDatabasePath, packageVersion, defaultISubsDir } = CONST;

// isub 資料庫自存的 Supscriptions 紀錄，作為初始化用，與訂閱用的不同
// dbpath 存 SID 與 Threads 的 Map

/**
 *
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

    this.version = packageVersion;
    this.subscriptions = [];

    const threadsMap = JSON.parse(fs.readFileSync(this.dbpath, 'utf-8'));
    const isubs = fs.readdirSync(isubsDir);
    this.subscriptions = isubs.map((isub) => new Subscription(`${isubsDir}/${isub}`));
    this.subscriptions.forEach((s) => {
      s.loadThreads(threadsMap[s.sid]);
    });
  }

  /**
   * @param {any} subscription
   * @return {boolean} success
   * @memberof Database
   */
  add(subscription) {
    if (!(subscription instanceof Subscription)) {
      throw new TypeError('Parameter should be a Subscription.');
    }
    subscription.generateSid(this.subscriptions.map((s) => s.sid));
    this.subscriptions.push(subscription);
    return true;
  }

  /**
   * @param {string} sid
   * @return {boolean} success
   * @memberof Database
   */
  remove(sid) {
    const index = this.subscriptions.findIndex((elem) => {
      return elem.sid === sid;
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
    const threadsMap = this.subscriptions.reduce((prev, cur) => {
      prev[cur.sid] = cur.threads;
      return prev;
    }, {});
    fs.writeFileSync(this.dbpath, JSON.stringify(threadsMap));

    this.subscriptions.forEach((s) => {
      let { sid, title, keywords, episodeParser, userBlacklistPatterns } = s;
      if (episodeParser) {
        episodeParser = episodeParser.toString();
      }
      userBlacklistPatterns = userBlacklistPatterns.map((ubp) => ubp.toString());
      const yamlData = yaml.safeDump({ sid, title, keywords, episodeParser, userBlacklistPatterns });
      fs.writeFileSync(`${this.isubsDir}/${sid}.yml`, yamlData);
    });
  }

  // list() {
  //   const subList = this.subscriptions.map((s) => {
  //     const latest = s.latest > 0 ? s.latest.toString().padStart(2, '0') : '--';
  //     return {
  //       sid: s.sid,
  //       latest,
  //       name: s.name,
  //     };
  //   });
  //   print.table(subList);
  // }

  // download(thread, { client, destination, jsonrpc, webhook } = {}) {
  //   client = client || this.config.get('client');
  //   jsonrpc = jsonrpc || this.config.get('jsonrpc');
  //   destination = destination || this.config.get('destination');
  //   webhook = webhook || this.config.get('webhook');

  //   const script = path.resolve(`${__dirname}/downloaders/${client}.js`);
  //   const args = [thread, { destination, jsonrpc, webhook }].map(JSON.stringify);
  //   args.unshift(script);

  //   return new Promise((resolve, reject) => {
  //     const task = spawn('node', args, {
  //       stdio: 'inherit',
  //     });
  //     task.on('close', (code) => {
  //       if (code === 0) resolve(code);
  //       else reject(code);
  //     });
  //     task.on('error', (err) => reject(err));
  //   });
  // }

  // has(key, value) {
  //   const results = this.subscriptions.filter((s) => s[key] === value);
  //   return !!results.length;
  // }

  // query(key, value) {
  //   const results = this.subscriptions.filter((s) => s[key] === value);
  //   return results[0] || null;
  // }

  // sort() {
  //   this.subscriptions.forEach((s) => s.sort());
  //   this.subscriptions.sort((a, b) => b.latest - a.latest);
  // }
}

exports.Database = Database;
