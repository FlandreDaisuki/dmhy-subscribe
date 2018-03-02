#!/usr/bin/env node

const { fetchThreads, search } = require('./crawler')
const { Subscription, Database } = require('./fakedb')

const fs = require('fs')
const program = require('commander')
const { question } = require('readline-sync')

const db = new Database({ dbfile: 'fakedb.json' })
const supportedClients = new Set(['aria2crpc', 'deluge-console'])

program
  .version(db.version)
  .option('--client <client>', 'Force using downloader. <client>: "aria2crpc", "deluge-console"(default)')
  .option('--jsonrpc <jsonrpc_uri>', 'jsonrpc url for --client=aria2crpc')
  .option('-d, --destination <path>', 'Download destination. (default: user downloads folder)')
  .on('--help', function () {
    console.log(`
  Examples:

    $ dmhy add '紫羅蘭永恆花園,動漫國,繁體,1080P'
    $ dmhy

    or

    $ dmhy --client aria2c
  `)
  })

program
  .command('add [subscribable...]')
  .option('-f, --file <path>', 'Add subscribables from a file.')
  .option('-y, --yes', 'Always add if {subscribable} name existed.')
  .option('-n, --no', 'Never add if {subscribable} name existed.')
  .description('Add {subscribable} to subscribe.')
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
            const ans = question(`The subscription{${s.name}} is existed, still add? [y/n]:`)
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
    console.log(`
  Details:

  A {subscribable} contains a name and following keywords to identify series
  you want to download, then joins them by CSV format in a string.

  Examples:

    Direct:
      $ dmhy add '紫羅蘭永恆花園,動漫國,繁體,1080P'
      $ dmhy add '紫羅蘭永恆花園,動漫國,繁體,1080P' 'pop team epic,極影,BIG5'

    File:
      $ dmhy ls --subscribable > a.txt
      $ dmhy rm --all
      $ dmhy add --file a.txt
  `)
  })

program
  .command('remove [sid...]')
  .alias('rm')
  .option('-a, --all', 'Remove all subscribed {subscription}.')
  .description(`Remove {subscription} by {sid}.`)
  .action(function (sids, cmd) {
    if (!sids.length && !cmd.all) {
      this.help()
    }

    if (cmd.all) {
      sids = [...db].map(s => s.sid)
    }

    for (const sid of sids) {
      const subscription = db.query('sid', sid)
      if (subscription) {
        db.remove(subscription)
      } else {
        console.error(`Not found subscription with sid: ${sid}.`)
      }
    }

    db.save()
    process.exit()
  })
  .on('--help', function () {
    console.log(`
  Details:

  The {sid} are listed at \`dmhy list\`.

  Examples:
    $ dmhy rm XYZ ABC
    $ dmhy rm --all
  `)
  })

program
  .command('list [sid...]')
  .alias('ls')
  .option('-s, --subscribable', 'List subscribable format.')
  .description('List the {subscription}s or the {thread}s of the {subscription}s.')
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
    console.log(`
  Examples:
    $ dmhy list ABC
    $ dmhy ls -s`)
  })

program
  .command('download [thid...]')
  .alias('dl')
  .description('Download the {thread}s of the {subsciption}s which are subscribed in list.')
  .action(async function (thids, cmd) {
    if (!thids.length) {
      this.help()
    } else {
      if (cmd.parent.client && !supportedClients.has(cmd.parent.client)) {
        console.error('Not support client:', cmd.parent.client)
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
    console.log(`
  Details:
  The {thid} format: {sid}-{ep}
  The {ep} format: int | float | {int|float}..{int|float} | {ep},{ep} | 'all'

  If only {sid}, means {sid}-all.


  Examples:
    $ dmhy ls
    sid  latest  name
    ---  ------  --------------
    AAA  09      nameAAA
    BBB  07      nameBBB(which has ep5.5)

    $ dmhy download AAA-01 BBB-5.5,7 # download (1 + 2) threads

    which is the same as following

    $ dmhy download AAA-01 BBB-5.5 BBB-7

    also support different downloader

    $ dmhy --client aria2c download AAA BBB

  More complicated example:

    $ dmhy dl AAA BBB-5..6,9 # download (9 + 3) threads

    which download all AAA threads and ep 5, 5.5, 6 in BBB threads

    $ dmhy ls AAA
    Episode  Title
    -------  --------------
    1        [字幕組][nameAAA][01]
    2,3      [字幕組][nameAAA][02-03]

    $ dmhy dl AAA-02 # download 1 threads which has 2 episodes
  `)
  })

program
  .command('search <keyword>')
  .option('--raw', 'Print a json array of threads to console.')
  .description('Show the search result of the keyword.(seperated by comma)')
  .action(async function (kw, cmd) {
    const threads = await search(kw.split(','))
    if (!cmd.raw) {
      threads.forEach(t => console.log(t.title))
      console.log(`Total ${threads.length} result${threads.length > 1 ? 's' : ''}.`)
    } else {
      console.log(JSON.stringify(threads))
    }
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
