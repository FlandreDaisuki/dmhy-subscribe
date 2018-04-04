const { l10n, consola } = require('../..');
exports.command = 'search <keywords>';

exports.aliases = ['find'];

exports.desc = l10n('CMD_FIND_DESC');

exports.builder = (yargs) => {
  // TODO
};

exports.handler = (argv) => {
  // TODO
  consola.log(JSON.stringify(argv, null, 2));
  process.exit(0);
};
