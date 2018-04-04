const { l10n, print } = require('../..');
exports.command = 'remove <SID...>';

exports.aliases = ['rm'];

exports.desc = l10n('CMD_RM_DESC');

exports.builder = (yargs) => {
  // TODO
};

exports.handler = (argv) => {
  // TODO
  print.log(JSON.stringify(argv, null, 2));
  process.exit(0);
};
