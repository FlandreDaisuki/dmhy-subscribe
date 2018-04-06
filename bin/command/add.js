const prompts = require('prompts');
const { l10n, print, Database, Subscription } = require('../..');

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
      print.error(msg);
      process.exit(1);
    })
    .example('$0 add "搖曳露營,萌喵,繁體,~1080p~"', l10n('CMD_ADD_EXAMPLE1_DESC'))
    .example('$0 add "./camp.yml"', l10n('CMD_ADD_EXAMPLE2_DESC'))
    .example('$0 add -i', l10n('CMD_ADD_EXAMPLE3_DESC'));
};

exports.handler = async (argv) => {
  const db = new Database();

  const safeAdd = async (sub) => {
    const existed = db.find(sub);
    if (existed) {
      if (argv.yes) {
        db.add(sub);
      } else if (!argv.yes && !argv.no) {
        // interactive ask
        const answer = await prompts({
          type: 'toggle',
          name: 'add',
          message: l10n('CMD_ADD_PROMPTS_CONFIRM', { title: sub.title }),
          initial: false,
          active: 'Yes',
          inactive: 'No',
        });
        if (answer.add) {
          db.add(sub);
        }
      }
    } else {
      db.add(sub);
    }
  };

  if (argv.interactive) {
    print.info(l10n('CMD_ADD_INTERACTIVE_INFO'));
    const iSubscriptionLike = {};
    do {
      // Ensure valid title
      const answer = await prompts({
        type: 'text',
        name: 'title',
        message: l10n('CMD_ADD_INTERACTIVE_TITLE'),

      });
      if (!answer.title) {
        print.error(l10n('CMD_ADD_INTERACTIVE_TITLE_ERR'));
      } else {
        iSubscriptionLike.title = answer.title;
        break;
      }
    } while (true);

    const answer = await prompts([{
      type: 'list',
      name: 'keywords',
      message: l10n('CMD_ADD_INTERACTIVE_KEYWORDS'),
      separator: ',',
    }, {
      type: 'list',
      name: 'unkeywords',
      message: l10n('CMD_ADD_INTERACTIVE_UNKEYWORDS'),
      separator: ',',
    }, {
      type: 'text',
      name: 'episodeParser',
      message: l10n('CMD_ADD_INTERACTIVE_EPISODEPARSER'),
      initial: '',
    }]);
    Object.assign(iSubscriptionLike, answer);
    const sub = new Subscription(iSubscriptionLike);
    await safeAdd(sub);
  } else {
    for (const subscribable of argv.subscribables) {
      const sub = new Subscription(subscribable);
      await safeAdd(sub);
    }
  }

  db.save();
  process.exit(0);
};
