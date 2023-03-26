BEGIN TRANSACTION;

CREATE TABLE IF NOT EXISTS threads (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  dmhy_link TEXT UNIQUE,
  magnet TEXT,
  title TEXT,
  publish_date TEXT
);

CREATE TABLE IF NOT EXISTS subscriptions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  sid TEXT UNIQUE,
  title TEXT NOT NULL,
  keywords TEXT, /* JSON string[] */
  episode_pattern TEXT, /* String of Regexp */
  exclude_pattern TEXT /* String of Regexp */
);

CREATE TABLE IF NOT EXISTS subscriptions_threads (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  subscription_id INTEGER,
  thread_id INTEGER,
  FOREIGN KEY(subscription_id) REFERENCES subscriptions(id),
  FOREIGN KEY(thread_id) REFERENCES threads(id)
);

CREATE TABLE IF NOT EXISTS configurations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT UNIQUE,
  value TEXT /* JSON */
);

INSERT OR IGNORE INTO configurations (name, value)
  VALUES ('downloader', 'system');

CREATE TABLE IF NOT EXISTS migrations (
  version TEXT NOT NULL UNIQUE,
  filename TEXT NOT NULL,
  created_at TEXT NOT NULL
);

/* app_datetime_now() will replace by database.mjs */
INSERT INTO migrations (version, filename, created_at)
  VALUES ('1.0.0', '1.0.0-create-all-tables.sql', app_datetime_now());

COMMIT;
