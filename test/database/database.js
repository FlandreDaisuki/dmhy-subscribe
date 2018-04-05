const fs = require('fs-extra');
const assert = require('assert');
const { Database, Subscription } = require('../..');

/**
 * dummy config
 */
class DummyConfig {}

const testDatabasePath = `${__dirname}/.dmhy-subscribe/db.json`;
const testFeedsDir = `${__dirname}/.dmhy-subscribe/feeds`;

const clearPaths = () => {
  fs.removeSync(testDatabasePath);
  fs.removeSync(testFeedsDir);
};

describe('database', () => {
  it('Database ctor', () => {
    assert.doesNotThrow(() => new Database({ dbpath: testDatabasePath, feedsDir: testFeedsDir }));
    assert.throws(() => new Database({ dbpath: testDatabasePath, feedsDir: testFeedsDir, config: new DummyConfig() }), Error);

    clearPaths();
    new Database({ dbpath: testDatabasePath, feedsDir: testFeedsDir });
    assert.ok(fs.existsSync(testDatabasePath));
    assert.ok(fs.existsSync(testFeedsDir));
    clearPaths();
  });

  it('Database#add', () => {
    clearPaths();
    const db = new Database({ dbpath: testDatabasePath, feedsDir: testFeedsDir });
    const subscribables = fs.readdirSync(`${__dirname}/../subscribables`);
    subscribables.forEach((subscribable) => {
      assert.doesNotThrow(() => db.add(new Subscription(`${__dirname}/../subscribables/${subscribable}`)));
    });
    assert.throws(() => db.add('string'), Error);
    clearPaths();
  });
});
