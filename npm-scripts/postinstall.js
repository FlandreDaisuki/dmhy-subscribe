const fs = require('fs-extra');
const semver = require('semver');
const { CONST, print, l10n, Database, Subscription } = require('..');
const { defaultProjectDataDir, packageVersion } = CONST;

const pre = fs.readJSONSync(`${defaultProjectDataDir}/.preinstall.json`);

if (semver.lt(pre.version, packageVersion.replace(/\.\d+$/, '.0'))) {
  print.warn(l10n('INCOMPATIBLE_UPGRADE'));

  fs.unlinkSync(`${defaultProjectDataDir}/fakedb.json`);
  fs.unlinkSync(`${defaultProjectDataDir}/config.json`);
  fs.unlinkSync(`${defaultProjectDataDir}/.version`);

  const db = new Database();
  for (const ss of pre.ss) {
    db.add(new Subscription(ss));
  }
  db.save();
}

fs.removeSync(`${defaultProjectDataDir}/.preinstall.json`);
