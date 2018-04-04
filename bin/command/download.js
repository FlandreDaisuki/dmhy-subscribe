const { l10n, print } = require('../..');
exports.command = 'download <THID...>';

exports.aliases = ['dl'];

exports.desc = l10n('CMD_DL_DESC');

exports.builder = (yargs) => {
  yargs
    .usage(l10n('CMD_DL_USAGE'));
};

exports.handler = (argv) => {
  // TODO
  print.log(JSON.stringify(argv, null, 2));
  process.exit(0);
};
