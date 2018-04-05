const fs = require('fs-extra');
const assert = require('assert');
const { Database, Subscription } = require('../..');

/**
 * dummy config
 */
class DummyConfig {}

const testDatabasePath = `${__dirname}/.dmhy-subscribe/db.json`;
const testISubsDir = `${__dirname}/.dmhy-subscribe/isubs`;

const testOpts = { dbpath: testDatabasePath, isubsDir: testISubsDir };

const clearPaths = () => {
  fs.removeSync(testDatabasePath);
  fs.removeSync(testISubsDir);
};

describe('database', () => {
  it('Database ctor', () => {
    assert.doesNotThrow(() => new Database(testOpts));
    assert.throws(() => new Database({ dbpath: testDatabasePath, isubsDir: testISubsDir, config: new DummyConfig() }), Error);

    clearPaths();
    new Database(testOpts);
    assert.ok(fs.existsSync(testDatabasePath));
    assert.ok(fs.existsSync(testISubsDir));
    clearPaths();
  });

  it('Database#add', () => {
    clearPaths();
    const db = new Database(testOpts);
    const subscribables = fs.readdirSync(`${__dirname}/../subscribables`);
    subscribables.forEach((subscribable) => {
      assert.doesNotThrow(() => db.add(new Subscription(`${__dirname}/../subscribables/${subscribable}`)));
    });
    assert.throws(() => db.add('string'), Error);
    clearPaths();
  });

  it('Database#save', () => {
    clearPaths();
    const db = new Database(testOpts);
    const subscribables = fs.readdirSync(`${__dirname}/../subscribables`);
    subscribables.forEach((subscribable) => {
      db.add(new Subscription(`${__dirname}/../subscribables/${subscribable}`));
    });
    db.save();

    const db2 = new Database(testOpts);
    assert.deepEqual(db, db2);
    clearPaths();
  });
});
