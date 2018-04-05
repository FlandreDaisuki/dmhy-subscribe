const fs = require('fs-extra');
const assert = require('assert');
const { Database, Subscription } = require('../..');

/**
 * dummy config
 */
class DummyConfig {}

const testDatabasePath = `${__dirname}/.dmhy-subscribe/db.json`;
const testSubsDir = `${__dirname}/.dmhy-subscribe/subs`;

const clearPaths = () => {
  fs.removeSync(testDatabasePath);
  fs.removeSync(testSubsDir);
};

describe('database', () => {
  it('Database ctor', () => {
    assert.doesNotThrow(() => new Database({ dbpath: testDatabasePath, subsDir: testSubsDir }));
    assert.throws(() => new Database({ dbpath: testDatabasePath, subsDir: testSubsDir, config: new DummyConfig() }), Error);

    clearPaths();
    new Database({ dbpath: testDatabasePath, subsDir: testSubsDir });
    assert.ok(fs.existsSync(testDatabasePath));
    assert.ok(fs.existsSync(testSubsDir));
    clearPaths();
  });

  it('Database#add', () => {
    clearPaths();
    const db = new Database({ dbpath: testDatabasePath, subsDir: testSubsDir });
    const subscribables = fs.readdirSync(`${__dirname}/../subscribables`);
    subscribables.forEach((subscribable) => {
      assert.doesNotThrow(() => db.add(new Subscription(`${__dirname}/../subscribables/${subscribable}`)));
    });
    assert.throws(() => db.add('string'), Error);
    clearPaths();
  });
});
