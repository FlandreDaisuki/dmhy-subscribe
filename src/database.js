const path = require('path');
const fs = require('fs-extra');
const { spawn } = require('child_process');
const { CONST, print } = require('./utils');
const { Config } = require('./config');
const { Subscription } = require('./dmhy/subscription');

const { defaultDatabasePath, packageVersion, defaultFeedsDir } = CONST;


/**
 *
 */
class Database {
  /**
   * Creates an instance of Database.
   * @param {any} options [{ dbpath = defaultDatabasePath, feedsDir = defaultFeedsDir, config = new Config() }={}]
   * @memberof Database
   */
  constructor({ dbpath = defaultDatabasePath, feedsDir = defaultFeedsDir, config = new Config() } = {}) {
    this.dbpath = dbpath;
    this.config = config;
    if (!(config instanceof Config)) {
      throw new Error(`Bad config`);
    }
    {this.version = packageVersion;}
    this.subscriptions = [];

    if (!fs.existsSync(this.dbpath)) {
      const empty = {
        version: packageVersion,
        subscriptions: {},
      };
      fs.writeFileSync(this.dbpath, JSON.stringify(empty));
    }

    if (!fs.existsSync(feedsDir)) {
      fs.mkdirSync(feedsDir);
    }

    const db = JSON.parse(fs.readFileSync(this.dbpath, 'utf-8'));
    const feeds = fs.readdirSync(feedsDir);
    this.subscriptions = feeds.filter((feed) => new Subscription(`${feedsDir}/${feed}`));
    this.subscriptions.forEach((subscription) => {
      subscription.threads = db.subscriptions[subscription.sid] || [];
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

  // remove(subscription) {
  //   if (!(subscription instanceof Subscription)) {
  //     throw new TypeError('Parameter should be a Subscription.');
  //   }
  //   const index = this.subscriptions.findIndex((elem) => {
  //     return elem.sid === subscription.sid;
  //   });
  //   if (index >= 0) {
  //     this.subscriptions.splice(index, 1);
  //     return true;
  //   }
  //   return false;
  // }

  // save() {
  //   const sav = {
  //     version: this.version,
  //     subscriptions: this.subscriptions,
  //   };
  //   fs.writeFileSync(this.dbpath, JSON.stringify(sav));
  // }

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
