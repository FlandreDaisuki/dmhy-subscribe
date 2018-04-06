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
    .example('$0 rm AAA', l10n('CMD_RM_EXAMPLE1_DESC'));
};

exports.handler = (argv) => {
  const db = new Database();

  if (argv.all) {
    const sids = db.subscriptions.map((sub) => sub.sid);
    sids.forEach((sid) => {
      const removed = db.remove(sid);
      if (removed) {
        print.success(l10n('CMD_RM_REMOVE_SUCCESS', { title: removed.title }));
      }
    });
  } else {
    argv.SID.forEach((sid) => {
      const removed = db.remove(sid);
      if (removed) {
        print.success(l10n('CMD_RM_REMOVE_SUCCESS', { title: removed.title }));
      }
    });
  }
  db.save();
  process.exit(0);
};
