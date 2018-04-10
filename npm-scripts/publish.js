const { version } = require('../package.json');
const { spawnSync } = require('child_process');

spawnSync('git', ['tag', `v${version}`]);
