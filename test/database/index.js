const fs = require('fs-extra');
const assert = require('assert');
const { Database, Subscription } = require('../..');

/**
 * dummy config
 */
class DummyConfig {}

const testDatabasePath = `${__dirname}/.dmhy-subscribe/db.json`;
const testISubsDir = `${__dirname}/.dmhy-subscribe/isubs`;

/**
 * @class TestDatabase
 * @extends {Database}
 */
class TestDatabase extends Database {
  /**   */
  constructor() {
    super({ dbpath: testDatabasePath, isubsDir: testISubsDir });
  }
}

const clearPaths = () => {
  fs.removeSync(testDatabasePath);
  fs.removeSync(testISubsDir);
};

describe('database', () => {
  it('Database ctor', () => {
    assert.doesNotThrow(() => new TestDatabase());
    assert.throws(() => new Database({ dbpath: testDatabasePath, isubsDir: testISubsDir, config: new DummyConfig() }), Error);

    clearPaths();
    new TestDatabase();
    assert.ok(fs.existsSync(testDatabasePath));
    assert.ok(fs.existsSync(testISubsDir));
    clearPaths();
  });

  it('Database#add', () => {
    clearPaths();
    const db = new TestDatabase();
    const subscribables = fs.readdirSync(`${__dirname}/../subscribables`);
    subscribables.forEach((subscribable) => {
      assert.doesNotThrow(() => db.add(new Subscription(`${__dirname}/../subscribables/${subscribable}`)));
    });
    assert.throws(() => db.add('string'), Error);
    clearPaths();
  });

  it('Database#save', () => {
    clearPaths();
    const db = new TestDatabase();
    const subscribables = fs.readdirSync(`${__dirname}/../subscribables`);
    subscribables.forEach((subscribable) => {
      db.add(new Subscription(`${__dirname}/../subscribables/${subscribable}`));
    });
    db.save();

    const db2 = new TestDatabase();
    assert.equal(db.dbpath, db2.dbpath);
    assert.equal(db.isubsDir, db2.isubsDir);
    assert.deepEqual(new Set(db.subscriptions), new Set(db2.subscriptions));
    clearPaths();
  });
});
