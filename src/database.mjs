import path from 'path';
import fs from 'fs/promises';
import { fileURLToPath } from 'url';
import sqlite3 from 'sqlite3';
import semver from 'semver';
import debug from 'debug';

import * as ENV from './env.mjs';
import { isFileExists } from './utils.mjs';

const d = debug('dmhy:database');

const databasePath = path.join(ENV.DATABASE_DIR, 'dmhy.sqlite3');
const thisFilePath = fileURLToPath(import.meta.url);
const thisFileDir = path.dirname(thisFilePath);
const migrationDir = path.join(thisFileDir, 'migrations');

if (!(await isFileExists(databasePath))) {
  await fs.writeFile(databasePath, '');
}

const sqlite = sqlite3.verbose();
export const db = new sqlite.Database(databasePath, (err) => {
  if (err) { console.error(err); }
});

/** @type {() => Promise<string>} */
const getLastMigrateVersion = async() => {
  return new Promise((resolve) => {
    db.get('SELECT version FROM migrations ORDER BY created_at DESC LIMIT 1', (err, row) => {
      if (err) {
        d('getLastMigrateVersion:err', err);
      }

      resolve(row?.version ?? '0.0.0');
    });
  });
};

const sortedAllMigrations = (await fs.readdir(migrationDir))
  .map((filename) => {
    return ({
      version: filename.replace(/-.*$/, ''),
      filename,
    });
  })
  .sort((a, b) => semver.compare(a.version, b.version));

const lastMigrateVersion = await getLastMigrateVersion();
d('lastMigrateVersion', lastMigrateVersion);

const sortedUnexecutedMigrations = sortedAllMigrations.filter((m) => semver.gt(m.version, lastMigrateVersion));

for (const unexecutedMigration of sortedUnexecutedMigrations) {
  const { filename } = unexecutedMigration;
  const filePath = path.join(migrationDir, filename);
  d('unexecutedMigration::filePath', filePath);

  const pseudoSql = await fs.readFile(filePath, 'utf8');
  const sql = pseudoSql.replaceAll('app_datetime_now()', JSON.stringify((new Date()).toISOString()));
  await new Promise((resolve, reject) => {
    db.exec(sql, (err) => {
      if (err) {
        d('unexecutedMigration:exec::err', err);
        return reject(err);
      }
      resolve();
    });
  });

  console.log(`Successfully run migration: ${filename}`);
}
