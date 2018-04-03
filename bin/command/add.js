const { l10n, consola } = require('../..');
exports.command = 'add [subscribables...]';

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
      consola.error(msg);
      process.exit(1);
    })
    .example('$0 add "搖曳露營,萌喵,繁體"', '使用訂閱用字串')
    .example('$0 add "./camp.yml"', '使用訂閱設定檔')
    .example('$0 add -i', '使用互動式界面');
};

exports.handler = (argv) => {
  // TODO
  consola.log(JSON.stringify(argv, null, 2));
  process.exit(0);
};
