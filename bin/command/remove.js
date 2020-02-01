const { l10n, print, Database } = require('../..');

exports.command = 'remove [SID...]';

exports.aliases = ['rm'];

exports.desc = l10n('CMD_RM_DESC');

exports.builder = (yargs) => {
  yargs
    .usage(l10n('CMD_RM_USAGE'))
    .options({
      'a': {
        alias: 'all',
        describe: l10n('CMD_RM_OPT_A'),
        type: 'boolean',
      },
    })
    .check((argv) => {
      if (!argv.SID && !argv.all) {
        throw new Error(l10n('CMD_RM_OPT_NO_A_NO_SID'));
      }
      return true;
    })
    // eslint-disable-next-line no-unused-vars
    .fail((msg, err) => {
      yargs.showHelp();
      console.log();
      print.error(msg);
      process.exit(1);
    })
    .example('dmhy rm AAA', l10n('CMD_RM_EXAMPLE1_DESC'));
};

exports.handler = (argv) => {
  const db = new Database();

  const sids = (argv.all) ? db.subscriptions.map((sub) => sub.sid) : argv.SID;
  sids.forEach((sid) => {
    const removed = db.remove(sid);
    if (removed) {
      print.success(l10n('CMD_RM_REMOVE_SUCCESS', { title: removed.title }));
    } else {
      print.error(l10n('CMD_RM_SID_NOT_FOUND', { sid }));
    }
  });

  db.save();
  process.exit(0);
};
