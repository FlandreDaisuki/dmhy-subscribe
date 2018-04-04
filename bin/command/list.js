const { l10n, print } = require('../..');
exports.command = 'list [SID...]';

exports.aliases = ['ls'];

exports.desc = l10n('CMD_LS_DESC');

exports.builder = (yargs) => {
  // TODO
};

exports.handler = (argv) => {
  // TODO
  print.log(JSON.stringify(argv, null, 2));
  process.exit(0);
};
