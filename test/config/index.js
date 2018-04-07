const fs = require('fs-extra');
const assert = require('assert');
const { Config } = require('../..');

const testConfigPath = `${__dirname}/config.json`;

/**
 * @class TestConfig
 * @extends {Config}
 */
class TestConfig extends Config {
  /**   */
  constructor() {
    super({ configpath: testConfigPath });
  }
}

const clearPaths = () => {
  fs.removeSync(testConfigPath);
};

describe('config', () => {
  it('Config ctor', () => {
    clearPaths();
    assert.doesNotThrow(() => new TestConfig());
    const config = new TestConfig();
    assert.deepEqual(config.parameters, Config.DEFAULTS);
    clearPaths();
  });

  it('Config#get Config#set Config#reset', () => {
    clearPaths();
    const config = new TestConfig();
    let _ = config.set('downloader', 'deluge');
    assert.deepEqual(_, { key: 'downloader', value: 'deluge' });
    _ = config.get('downloader');
    assert.deepEqual(_, { key: 'downloader', value: 'deluge' });

    config.reset('downloader');
    _ = config.get('downloader');
    assert.deepEqual(_, { key: 'downloader', value: 'system' });

    config.set('destination', '/tmp');
    _ = config.get('destination');
    assert.deepEqual(_, { key: 'destination', value: '/tmp' });
    config.reset();
    assert.deepEqual(config.parameters, Config.DEFAULTS);
    clearPaths();
  });
});
