const yaml = require('js-yaml');
const Table = require('easy-table');
const { l10n, Database, TheEpisode, print } = require('../..');

exports.command = 'list [SID...]';

exports.aliases = ['ls'];

exports.desc = l10n('CMD_LS_DESC');

exports.builder = (yargs) => {
  yargs
    .usage(l10n('CMD_LS_USAGE'))
    .options({
      'ss': {
        alias: 'subscribable-string',
        describe: l10n('CMD_LS_OPT_SS'),
        type: 'boolean',
      },
      'sy': {
        alias: 'subscribable-yaml',
        describe: l10n('CMD_LS_OPT_SY'),
        type: 'boolean',
      },
    })
    .check((argv) => {
      if (argv.ss && argv.sy) {
        throw new Error(l10n('CMD_LS_OPT_SYSS_ERR'));
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
    .example('dmhy ls AAA', l10n('CMD_LS_EXAMPLE1_DESC'))
    .example('dmhy ls -ss', l10n('CMD_LS_EXAMPLE2_DESC'));
};

exports.handler = (argv) => {
  const db = new Database();
  db.sort();

  if (argv.ss) {
    const sids = argv.SID || db.subscriptions.map((sub) => sub.sid);
    sids.forEach((sid) => {
      const sub = db.find({ sid }); // bad use XD
      console.log([sub.title, ...sub.keywords, ...sub.unkeywords.map((k) => `~${k}~`)].join(','));
    });
    process.exit(0);
  }

  if (argv.sy) {
    const sids = argv.SID || db.subscriptions.map((sub) => sub.sid);
    sids.forEach((sid) => {
      const sub = db.find({ sid }); // bad use XD
      const { title, keywords, unkeywords, episodeParser } = sub;
      console.log(yaml.dump({ title,
        keywords,
        unkeywords,
        episodeParser: `${episodeParser}` }));
    });
    process.exit(0);
  }

  // !argv.ss && !argv.sy
  if (argv.SID) {
    // some
    argv.SID.forEach((sid) => {
      const sub = db.find({ sid }); // bad use XD
      if (!sub) {
        print.error(l10n('CMD_LS_SID_NOT_FOUND', { sid }));
        process.exit(1);
      }
      const { title, keywords, unkeywords, episodeParser } = sub;
      const t = {};
      t[l10n('CMD_LS_CELL_SID')] = sid;
      t[l10n('CMD_LS_CELL_TITLE')] = title;
      t[l10n('CMD_LS_CELL_KEYWORDS')] = keywords.join(', ');
      t[l10n('CMD_LS_CELL_UNKEYWORDS')] = unkeywords.join(', ');
      t[l10n('CMD_LS_CELL_EPISODEPARSER')] = `${episodeParser}`;
      console.log(Table.print(t).trim());
      console.log();

      const tht = new Table();
      sub.threads.forEach((th) => {
        tht.cell(l10n('CMD_LS_CELL_THREAD_EPISODE'), th.episode.toString(TheEpisode.ascendCompare));
        tht.cell(l10n('CMD_LS_CELL_THREAD_TITLE'), th.title);
        tht.newRow();
      });
      console.log(tht.toString().trim());
      console.log();
    });
  } else {
    // all
    const t = new Table();
    db.subscriptions.forEach((sub) => {
      t.cell(l10n('CMD_LS_CELL_SID'), sub.sid);
      t.cell(l10n('CMD_LS_CELL_LATEST'), sub.latest < 0 ? '--' : sub.latest.toString().padStart(2, '0'));
      t.cell(l10n('CMD_LS_CELL_TITLE'), sub.title);
      t.newRow();
    });
    console.log(t.toString().trim());
  }
  process.exit(0);
};
