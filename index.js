#!/usr/bin/env node

const { fetchThreads, fetchThreadsByKeyword } = require('./crawler')
const { Subscription, Database } = require('./fakedb')
const { getLocaleString: l10n } = require('./utils')

const fs = require('fs')
const program = require('commander')
const { question } = require('readline-sync')

const db = new Database()

program
  .version(db.version)
  .option('-d, --destination <path>', l10n('MAIN_OPT_DESTINATION_MSG'))
  .option('--client <client>', l10n('MAIN_OPT_CLIENT_MSG'))
  .option('--jsonrpc <jsonrpc_uri>', l10n('MAIN_OPT_JSONRPC_MSG'))
  .on('--help', function () {
    console.log(l10n('MAIN_HELP_MSG'))
  })

program
  .command('add [subscribable...]')
  .option('-f, --file <path>', l10n('CMD_ADD_OPT_FILE_MSG'))
  .option('-y, --yes', l10n('CMD_ADD_OPT_YES_MSG'))
  .option('-n, --no', l10n('CMD_ADD_OPT_NO_MSG'))
  .description(l10n('CMD_ADD_DESC_MSG'))
  .action(function (subscribables, cmd) {
    if (!subscribables.length && !cmd.file) {
      this.help()
    }

    if (cmd.file) {
      const file = fs.readFileSync(cmd.file, 'utf8')
      subscribables = file.split(/\r?\n/).filter(_ => _)
    }

    for (const subscribable of subscribables) {
      if (subscribable) {
        const s = new Subscription(subscribable)
        let toAdd = true
        if (db.has('name', s.name)) {
          if (cmd.no && !cmd.yes) {
            toAdd = false
          } else if (!cmd.no && cmd.yes) {
            toAdd = true
          } else {
            const ans = question(l10n('CMD_ADD_EXISTED_QUESTION_MSG', { name: s.name }))
            if (/^n/i.test(ans)) {
              toAdd = false
            } else if (/^y/i.test(ans)) {
              toAdd = true
            } else {
              toAdd = null
            }
          }
        }
        if (typeof toAdd === 'boolean' && toAdd) {
          db.add(s)
        }
      }
    }

    db.save()
    process.exit()
  })
  .on('--help', function () {
    console.log(l10n('CMD_ADD_HELP_MSG'))
  })

program
  .command('remove [sid...]')
  .alias('rm')
  .option('-a, --all', l10n('CMD_RM_OPT_ALL_MSG'))
  .description(l10n('CMD_RM_DESC_MSG'))
  .action(function (sids, cmd) {
    if (!sids.length && !cmd.all) {
      this.help()
    }

    if (cmd.all) {
      sids = db.subscriptions.map(s => s.sid)
    }

    for (const sid of sids) {
      const subscription = db.query('sid', sid)
      if (subscription) {
        db.remove(subscription)
      } else {
        console.error(l10n('CMD_RM_NOTFOUND_MSG', { sid }))
      }
    }

    db.save()
    process.exit()
  })
  .on('--help', function () {
    console.log(l10n('CMD_RM_HELP_MSG'))
  })

program
  .command('list [sid...]')
  .alias('ls')
  .option('-s, --subscribable', l10n('CMD_LS_OPT_SUBSCRIBABLE_MSG'))
  .description(l10n('CMD_LS_DESC_MSG'))
  .action(function (sids, cmd) {
    if (cmd.subscribable) {
      for (const s of db.subscriptions) {
        console.log([s.name, ...s.keywords].join(','))
      }
    } else if (sids.length) {
      for (const sid of sids) {
        const s = db.query('sid', sid)
        if (s) {
          cmd.subscribable ? console.log([s.name, ...s.keywords].join(',')) : s.list()
        }
      }
    } else {
      db.list()
    }

    process.exit()
  })
  .on('--help', function () {
    console.log(l10n('CMD_LS_HELP_MSG'))
  })

program
  .command('download [thid...]')
  .alias('dl')
  .description(l10n('CMD_DL_DESC_MSG'))
  .action(async function (thids, cmd) {
    if (!thids.length) {
      this.help()
    } else {
      if (cmd.parent.client && !Database.isSupportedClient(cmd.parent.client)) {
        console.error(l10n('CMD_DL_UNKNOWN_CLIENT_MSG', { client: cmd.parent.client }))
        process.exit(1)
      }

      const thTasks = []

      for (const thid of thids) {
        const [sid, epstr] = thid.split('-')
        const s = db.query('sid', sid)
        if (s) {
          thTasks.push(...s.getThreads(epstr).map(th => db.download(th, cmd.parent)))
        }
      }

      await Promise.all(thTasks).catch(err => {
        console.error(err)
        process.exit(1)
      })

      process.exit()
    }
  })
  .on('--help', function () {
    console.log(l10n('CMD_DL_HELP_MSG'))
  })

program
  .command('search <keywords>')
  .alias('find')
  .option('--raw', l10n('CMD_FIND_OPT_RAW_MSG'))
  .description(l10n('CMD_FIND_DESC_MSG'))
  .action(async function (kw, cmd) {
    const threads = await fetchThreadsByKeyword(kw.split(','))
    if (!cmd.raw) {
      threads.forEach(th => console.log(th.title))
      console.log(l10n('CMD_FIND_SUMMARY_MSG', { total: threads.length }))
    } else {
      console.log(JSON.stringify(threads))
    }
    process.exit()
  })
  .on('--help', function () {
    console.log(l10n('CMD_FIND_HELP_MSG'))
  })

program
  .command('update [sid...]')
  .option('-a, --all', l10n('CMD_UPDATE_OPT_ALL_MSG'))
  .description(l10n('CMD_UPDATE_DESC_MSG'))
  .action(async function (sids, cmd) {
    await Promise.all(
      db.subscriptions
        .filter(s => cmd.all || sids.includes(s.sid))
        .map(s => {
          return fetchThreads(s)
            .then(newThreads => {
              for (const nth of newThreads) {
                if (!s.threads.map(th => th.title).includes(nth.title)) {
                  console.log(l10n('CMD_UPDATE_UPDATED_MSG', { title: nth.title }))
                  s.add(nth)
                }
              }
            })
            .catch(error => {
              console.error(error)
              process.exit(1)
            })
        })
    )

    db.sort()
    db.save()
    process.exit()
  })
  .on('--help', function () {
    console.log(l10n('CMD_UPDATE_HELP_MSG'))
  })

program
  .command('config [key] [value]')
  .alias('cfg')
  .option('-r, --reset', l10n('CMD_CFG_OPT_RESET_MSG'))
  .option('--list-all', l10n('CMD_CFG_OPT_LIST_ALL_MSG'))
  .description(l10n('CMD_CFG_DESC_MSG'))
  .action(function (key, value, cmd) {
    if (cmd.listAll) {
      db.config.list()
      process.exit()
    }
    if (cmd.reset) {
      db.config.reset(key)
      process.exit()
    }
    if (key) {
      if (value) {
        // setter
        const ret = db.config.set(key, value)
        if (ret === undefined) {
          console.error(`Invalid key: ${key}`)
        }
      } else {
        // getter
        const val = db.config.get(key)
        if (val === undefined) {
          console.error(`Invalid key: ${key}`)
        } else {
          console.log(val)
        }
      }
    }
    process.exit()
  })
  .on('--help', function () {
    console.log(l10n('CMD_CFG_HELP_MSG'))
  })

program.parse(process.argv)

// $ dmhy
if (program.args.every(arg => !(arg instanceof program.Command))) {
  Promise.all(
    db.subscriptions.map(s => {
      return fetchThreads(s)
        .then(newThreads => {
          for (const nth of newThreads) {
            if (!s.threads.map(th => th.title).includes(nth.title)) {
              db.download(nth, program).catch(console.err)
              s.add(nth)
            }
          }
        })
        .catch(error => {
          console.error(error)
        })
    })
  ).then(() => {
    db.sort()
    db.save()
  })
}
