const { l10n, consola } = require('../..');
exports.command = 'list [SID...]';

exports.aliases = ['ls'];

exports.desc = l10n('CMD_LS_DESC');

exports.builder = (yargs) => {
  // TODO
};

exports.handler = (argv) => {
  // TODO
  consola.log(JSON.stringify(argv, null, 2));
  process.exit(0);
};
