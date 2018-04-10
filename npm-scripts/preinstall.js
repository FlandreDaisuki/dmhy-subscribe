const pkg = require('../package.json');
const fs = require('fs-extra');
const { CONST } = require('..');
const { defaultProjectDataDir } = CONST;

const db = fs.readJSONSync(`${defaultProjectDataDir}/fakedb.json`);
const ss = []; // subscribable string

if (Array.isArray(db)) {
  // 0.3.x
  for (const sub of db) {
    ss.push([sub.name, ...sub.keywords].join(','));
  }
} else if (db.subscriptions) {
  // 0.5.x
  for (const sub of db.subscriptions) {
    ss.push([sub.name, ...sub.keywords].join(','));
  }
}

fs.writeJSONSync(`${defaultProjectDataDir}/.preinstall.json`, {
  version: pkg.version,
  ss,
});
