const fs = require('fs-extra');
const { CONST } = require('..');
const { defaultProjectDataDir, defaultVersionPath, packageVersion } = CONST;

const ss = []; // subscribable string
let version = '';
if (fs.existsSync(defaultVersionPath)) {
  version = fs.readFileSync(defaultVersionPath, 'utf-8');
} else {
  version = packageVersion;
}

if (fs.existsSync(`${defaultProjectDataDir}/fakedb.json`)) {
  const db = fs.readJSONSync(`${defaultProjectDataDir}/fakedb.json`);
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
}

fs.writeJSONSync(`${defaultProjectDataDir}/.preinstall.json`, {
  version,
  ss,
});
