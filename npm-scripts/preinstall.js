const fs = require('fs');
const os = require('os');

const defaultProjectDataDir = (() => {
  if (process.env.NODE_ENV === 'development') {
    return `${os.homedir()}/.dmhy-subscribe-dev`;
  } else {
    return `${os.homedir()}/.dmhy-subscribe`;
  }
})();
const defaultVersionPath = `${defaultProjectDataDir}/.version`;
const packageVersion = require('../package.json').version;

const ss = []; // subscribable string
let version = '';

if (!fs.existsSync(defaultProjectDataDir)) {
  fs.mkdirSync(defaultProjectDataDir);
}

if (fs.existsSync(defaultVersionPath)) {
  version = fs.readFileSync(defaultVersionPath, 'utf-8');
} else {
  version = packageVersion;
}

if (fs.existsSync(`${defaultProjectDataDir}/fakedb.json`)) {
  const db = JSON.parse(fs.readFileSync(`${defaultProjectDataDir}/fakedb.json`, 'utf-8'));
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

fs.writeFileSync(`${defaultProjectDataDir}/.preinstall.json`, JSON.stringify({
  version,
  ss,
}));
