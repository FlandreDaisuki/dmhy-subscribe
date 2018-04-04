const { l10n, print } = require('../..');
exports.command = 'search <keywords>';

exports.aliases = ['find'];

exports.desc = l10n('CMD_FIND_DESC');

exports.builder = (yargs) => {
  // TODO
};

exports.handler = (argv) => {
  // TODO
  print.log(JSON.stringify(argv, null, 2));
  process.exit(0);
};
