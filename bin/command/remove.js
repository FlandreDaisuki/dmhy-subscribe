const { l10n, consola } = require('../..');
exports.command = 'remove <SID...>';

exports.aliases = ['rm'];

exports.desc = l10n('CMD_RM_DESC');

exports.builder = (yargs) => {
  // TODO
};

exports.handler = (argv) => {
  // TODO
  consola.log(JSON.stringify(argv, null, 2));
  process.exit(0);
};
