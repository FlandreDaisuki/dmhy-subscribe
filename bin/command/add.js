const { l10n, print } = require('../..');
exports.command = 'add [subscribable...]';

exports.aliases = [];

exports.desc = l10n('CMD_ADD_DESC');

exports.builder = (yargs) => {
  yargs
    .usage(l10n('CMD_ADD_USAGE'))
    .options({
      'i': {
        alias: 'interactive',
        describe: l10n('CMD_ADD_OPT_I'),
        type: 'boolean',
      },
      'y': {
        alias: 'yes',
        describe: l10n('CMD_ADD_OPT_Y'),
        type: 'boolean',
      },
      'n': {
        alias: 'no',
        describe: l10n('CMD_ADD_OPT_N'),
        type: 'boolean',
      },
    })
    .check((argv) => {
      if (argv.yes && argv.no) {
        throw new Error(l10n('CMD_ADD_OPT_YN_ERR'));
      }
      if (!argv.subscribables && !argv.interactive) {
        throw new Error(l10n('CMD_ADD_OPT_NO_I_NO_SUBS'));
      }
      return true;
    })
    .fail((msg, err) => {
      // yargs.showHelp();
      print.error(msg);
      process.exit(1);
    })
    .example('$0 add "搖曳露營,萌喵,繁體,~1080p~"', l10n('CMD_ADD_EXAMPLE1_DESC'))
    .example('$0 add "./camp.yml"', l10n('CMD_ADD_EXAMPLE2_DESC'))
    .example('$0 add -i', l10n('CMD_ADD_EXAMPLE3_DESC'));
};

exports.handler = (argv) => {
  // TODO
  print.log(JSON.stringify(argv, null, 2));
  process.exit(0);
};
