import path from 'path';
import fs from 'fs/promises';
import { fileURLToPath } from 'url';
import sqlite3 from 'sqlite3';
import semver from 'semver';
import debug from 'debug';
import * as ENV from './env.mjs';
import * as logger from './logger.mjs';
import { isFileExists, parsePattern, sidHash } from './utils.mjs';

/** @type {(db: sqlite3.Database) => Promise<string>} */
const getLastMigrateVersion = async(db) => {
  return new Promise((resolve) => {
    db.get('SELECT version FROM migrations ORDER BY created_at DESC LIMIT 1', (err, row) => {
      if (err) {
        debug('dmhy:database:getLastMigrateVersion')(err);
      }

      resolve(row?.version ?? '0.0.0');
    });
  });
};

const execMigration = async(migrationDir, db) => {
  const sortedAllMigrations = (await fs.readdir(migrationDir))
    .map((filename) => {
      return ({
        version: filename.replace(/-.*$/, ''),
        filename,
      });
    })
    .sort((a, b) => semver.compare(a.version, b.version));

  const lastMigrateVersion = await getLastMigrateVersion(db);
  debug('dmhy:database:lastMigrateVersion')(lastMigrateVersion);

  const sortedUnexecutedMigrations = sortedAllMigrations.filter((m) => semver.gt(m.version, lastMigrateVersion));

  for (const unexecutedMigration of sortedUnexecutedMigrations) {
    const { filename } = unexecutedMigration;
    const filePath = path.join(migrationDir, filename);
    debug('dmhy:database:unexecutedMigration')(filePath);

    const pseudoSql = await fs.readFile(filePath, 'utf8');
    const sql = pseudoSql.replaceAll('app_datetime_now()', JSON.stringify((new Date()).toISOString()));
    await new Promise((resolve, reject) => {
      db.exec(sql, (err) => {
        if (err) {
          debug('dmhy:database:unexecutedMigration')(err);
          return reject(err);
        }
        resolve();
      });
    });

    logger.log(`Successfully run migration: ${filename}`);
  }
};

export const getMigratedDb = async(databasePath = path.join(ENV.DATABASE_DIR, 'dmhy.sqlite3')) => {
  if (databasePath !== ':memory:' && !(await isFileExists(databasePath))) {
    await fs.writeFile(databasePath, '');
  }

  const sqlite = sqlite3.verbose();
  const db = new sqlite.Database(databasePath, (err) => {
    if (err) { console.error(err); }
  });

  const thisFilePath = fileURLToPath(import.meta.url);
  const thisFileDir = path.dirname(thisFilePath);
  const migrationDir = path.join(thisFileDir, 'migrations');
  await execMigration(migrationDir, db);
  return db;
};

export const isExistingSubscriptionSid = async(sid, db) => {
  return new Promise((resolve, reject) => {
    db.get('SELECT id FROM subscriptions WHERE sid = ?', [sid], (err, rows) => {
      if (err) { return reject(err); }
      resolve(Boolean(rows));
    });
  });
};

export const isExistingSubscriptionTitle = async(title, db) => {
  return new Promise((resolve, reject) => {
    db.get('SELECT id FROM subscriptions WHERE title = ?', [title], (err, rows) => {
      if (err) { return reject(err); }
      resolve(Boolean(rows));
    });
  });
};

/**
 * @param {string} title
 * @param {Object} option
 * @param {string[]} option.keywords
 * @param {string} option.episodePatternString
 * @param {string} option.excludePatternString
 */
export const createSubscription = async(title, option = {}, db) => {
  let sid = '';
  const keywords = option?.keywords ?? [];
  const episodePatternString = option?.episodePatternString ?? '/$^/';
  const excludePatternString = option?.excludePatternString ?? '/$^/';
  do {
    sid = sidHash(title, keywords, excludePatternString, episodePatternString, sid);
  } while (await isExistingSubscriptionSid(sid, db));

  const statement = db.prepare('INSERT INTO subscriptions (sid, title, keywords, exclude_pattern, episode_pattern) VALUES (?,?,?,?,?)');
  return new Promise((resolve) => {
    statement.run([sid, title, JSON.stringify(keywords), excludePatternString, episodePatternString], function(err) {
      if (err) {
        console.error(err);
      }
      resolve(this);
    });
  });
};

export const getAllSubscriptions = async(db) => {
  return new Promise((resolve, reject) => {
    db.all('SELECT * FROM subscriptions', (err, rows) => {
      if (err) { return reject(err); }
      resolve(rows.map((row) => {
        return {
          id: row.id,
          sid: row.sid,
          title: row.title,
          keywords: JSON.parse(row.keywords),
          episodePattern: parsePattern(row.episode_pattern),
          excludePattern: parsePattern(row.exclude_pattern),
        };
      }));
    });
  });
};

export const getLatestThreadsInEachSubscription = async(db) => {
  const sql = `
  SELECT sub.id AS sub_id, sub.sid, sub.title AS sub_title, sub.episode_pattern, et.id AS thread_id, et.title AS thread_title
  FROM subscriptions sub
  JOIN (
    SELECT st.subscription_id, t.*, ROW_NUMBER() OVER (
      PARTITION BY st.subscription_id ORDER BY t.publish_date DESC
    ) AS rn
    FROM subscriptions_threads st
    JOIN threads t ON st.thread_id = t.id
  ) et ON sub.id = et.subscription_id AND et.rn = 1;
  `;

  return new Promise((resolve, reject) => {
    db.all(sql, (err, rows) => {
      if (err) { return reject(err); }
      resolve(rows.map((row) => ({
        subscriptionId: row.sub_id,
        threadId: row.thread_id,
        sid: row.sid,
        subscriptionTitle: row.sub_title,
        threadTitle: row.thread_title,
        episodePatternString: row.episode_pattern,
      })));
    });
  });
};

/**
 * @param {string} sid
 * @param {sqlite3.Database} db
 */
export const getThreadsBySid = async(sid, db) => {
  const sql = `
  SELECT t.*, sub.episode_pattern, sub.sid
  FROM subscriptions sub
  JOIN subscriptions_threads st ON st.subscription_id = sub.id
  JOIN threads t ON st.thread_id = t.id
  WHERE sub.sid = ?;
  `;

  return new Promise((resolve, reject) => {
    db.all(sql, [sid], (err, rows) => {
      if (err) { return reject(err); }
      resolve(rows.map((row) => ({
        id: row.id,
        sid: row.sid,
        title: row.title,
        episodePatternString: row.episode_pattern,
        magnet: row.magnet,
        publishDate: row.publish_date,
      })));
    });
  });
};

export const isExistingThreadDmhyLink = async(dmhyLink, db) => {
  return new Promise((resolve, reject) => {
    db.get('SELECT id FROM threads WHERE dmhy_link = ?', [dmhyLink], (err, rows) => {
      if (err) { return reject(err); }
      resolve(Boolean(rows));
    });
  });
};

export const createThread = async(dmhyLink, magnet, title, publishDate, db) => {
  const statement = db.prepare('INSERT INTO threads (dmhy_link, magnet, title, publish_date) VALUES (?, ?, ?, ?)');
  return new Promise((resolve, reject) => {
    statement.run([dmhyLink, magnet, title, publishDate], function(err) {
      if (err) { return reject(err); }
      resolve(this);
    });
  });
};

export const bindSubscriptionAndThread = async(subscriptionId, threadId, db) => {
  const statement = db.prepare('INSERT INTO subscriptions_threads (subscription_id, thread_id) VALUES (?, ?)');
  return new Promise((resolve, reject) => {
    statement.run([subscriptionId, threadId], function(err) {
      if (err) { return reject(err); }
      resolve(this);
    });
  });
};

export const getAllConfigurations = async(db) => {
  return new Promise((resolve, reject) => {
    db.all('SELECT * FROM configurations', (err, rows) => {
      if (err) { return reject(err); }
      resolve(rows.map((row) => {
        return {
          name: row.name,
          value: row.value,
        };
      }));
    });
  });
};

/**
 * @param {string} name
 * @param {string} value
 * @param {sqlite3.Database} db
 * @returns {Promise<sqlite3.RunResult>}
 */
export const setConfiguration = async(name, value, db) => {
  const statement = db.prepare('UPDATE configurations SET value = ? WHERE name = ?');
  return new Promise((resolve, reject) => {
    statement.run([value, name], function(err) {
      if (err) { return reject(err); }
      resolve(this);
    });
  });
};
