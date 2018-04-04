const { l10n, consola } = require('../..');
exports.command = 'config [key] [value]';

exports.aliases = ['cfg'];

exports.desc = l10n('CMD_CFG_DESC');

exports.builder = (yargs) => {
  yargs
    .usage(l10n('CMD_CFG_USAGE'))
    .example('$0 config', l10n('CMD_CFG_EXAMPLE1_DESC'))
    .example('$0 config client', l10n('CMD_CFG_EXAMPLE2_DESC'))
    .example('$0 config client deluge', l10n('CMD_CFG_EXAMPLE3_DESC'));
};

exports.handler = (argv) => {
  // TODO
  consola.log(JSON.stringify(argv, null, 2));
  process.exit(0);
};
