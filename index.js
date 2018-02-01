#!/usr/bin/env node

const fs = require('fs')
const path = require('path')
const axios = require('axios')
const cheerio = require('cheerio')
const program = require('commander')
const { spawn } = require('child_process')
const pkg = require('./package.json')

const CWD = process.cwd()
// Make cwd to source
process.chdir(__dirname)

if (!fs.existsSync('fakedb.json')) {
  fs.writeFileSync('fakedb.json', '[]')
}

class Database {
  constructor (fakedb) {
    this.data = fakedb
  }

  * [Symbol.iterator] () {
    for (const anime of this.data) {
      yield anime
    }
  }

  push (anime) {
    if (anime) {
      this.data.push(anime)
    }
  }
  pop (anime) {
    const index = this.data.findIndex(elem => {
      return elem.vid === anime.vid
    })
    if (index >= 0) {
      this.data.splice(index, 1)
    }
  }
  save () {
    try {
      for (const anime of this.data) {
        anime.episodes.sort((a, b) => b.ep - a.ep)
      }
      this.data.sort((a, b) => b.episodes[0].ep - a.episodes[0].ep)
    } catch (error) {
      // new anime added
    }

    fs.writeFileSync('fakedb.json', JSON.stringify(this.data))
  }
  list () {
    console.log(`vid | latest | name`)
    console.log()
    for (const anime of this.data) {
      const lastEpisode = anime.episodes[0]
      const latest = (lastEpisode ? lastEpisode.ep : '--').toString().padStart(2, '0')
      console.log(`${anime.vid} |   ${latest}   | ${anime.name}`)
    }
  }
  query (key, val) {
    function parseEpkey (episodes, epkey) {
      if (!epkey || epkey.includes('all')) {
        return 'all'
      } else if (epkey.includes(',')) {
        return epkey.split(/,\s*/)
          .map(epk => parseEpkey(episodes, epk))
          .reduce((acc, val) => val >= 0 ? acc.concat(val) : acc, [])
      } else if (epkey.includes('..')) {
        let [p, q] = epkey.split('..')
        p = parseFloat(p)
        q = parseFloat(q)
        if (p > q) {
          [p, q] = [q, p]
        }

        const P = episodes.findIndex(episode => episode.ep >= p)
        let Q = episodes.findIndex(episode => episode.ep > q)
        Q = Q < 0 ? episodes.length : Q + 1

        return episodes.slice(P, Q).map(episode => episode.ep)
      } else if (epkey.match(/\d+\.?\d*/)) {
        return parseFloat(epkey)
      } else {
        console.error('parseEpkey: Unknown epkey: ', epkey)
        return null
      }
    }

    switch (key) {
      case 'vid':
      case 'name':
        return this.data.find(anime => anime[key] === val) || null

      case 'epid': {
        const [vid, epkeyStr] = val.split('-')
        const anime = this.data.find(anime => anime.vid === vid)
        if (!anime) {
          return null
        }
        const epkeys = parseEpkey(anime.episodes, epkeyStr)
        if (epkeys === 'all') {
          return anime.episodes
        } else {
          return anime.episodes.filter(episode => [].concat(epkeys).includes(episode.ep))
        }
      }

      default:
        return null
    }
  }
  download (episode) {
    return new Promise((resolve, reject) => {
      const task = spawn('deluge-console', ['add', `"${episode.link}"`])

      task.on('close', code => {
        if (code === 0) {
          console.log(`Add ${episode.title}.`)
          resolve(code)
        } else {
          console.error(`Failed to add ${episode.title}.`)
          reject(code)
        }
      })

      task.on('error', err => {
        console.error('Failed to start subprocess.')
        reject(err)
      })
    })
  }
  createAnime (str) {
    const [name, ...keywords] = str.split(',')
    return {
      vid: this.generateVid(name),
      name,
      keywords,
      episodes: []
    }
  }
  generateVid (name) {
    const hash = Buffer.from(name).toString('base64')
      .replace(/[\W\d]/g, '')
      .toUpperCase()
      .split('')
      .reverse()
      .join('')

    for (let offset = 0; offset <= hash.length - 3; offset++) {
      const vid = hash.slice(offset).slice(0, 3)
      if (vid.length === 3 && !this.query('vid', vid)) {
        return vid
      }
    }

    return this.generateVid(name + hash)
  }
}

let fakedb = []

try {
  fakedb = JSON.parse(fs.readFileSync('fakedb.json'))
} catch (error) {
  fakedb = []
}

const db = new Database(fakedb)

program
  .version(pkg.version)

program
  .command('add [anime...]')
  .option('-f, --file <path>', 'Add from file.')
  .description(`
  Add <anime> to subscribe.

  A <anime> contains a name and following keywords
  to identify series you want to download, then
  joins them by CSV format in a string.

  Examples:

    Direct:
      $ dmhy add '紫羅蘭永恆花園,動漫國,繁體,1080P'
      $ dmhy add '紫羅蘭永恆花園,動漫國,繁體,1080P' 'pop team epic,極影,BIG5'

    File:
      $ dmhy ls --addable > a.txt
      $ dmhy rm --all
      $ dmhy add --file a.txt
  `)
  .action(function (animes, cmd) {
    if (!animes.length && !cmd.file) {
      this.help()
    } else {
      if (cmd.file) {
        const file = fs.readFileSync(path.normalize(path.join(CWD, cmd.file)), 'utf8')
        for (const animeStr of file.split(/\r?\n/)) {
          if (animeStr) {
            animes.push(animeStr)
          }
        }
      }

      for (const animeStr of animes) {
        const anime = db.createAnime(animeStr)
        if (!db.query('name', anime.name)) {
          db.push(anime)
          console.log(`Add ${anime.name} successfully.`)
        } else {
          console.error(`Anime ${anime.name} has existed.`)
        }
      }

      db.save()
      process.exit()
    }
  })

program
  .command('remove [vid...]')
  .alias('rm')
  .option('-a, --all', 'Remove all subscribed <anime>.')
  .description(`
  Unsubscribe <anime> by <vid>.

  The <vid> are listed at \`$ dmhy list\`.

  Examples:
    $ dmhy rm XYZ ABC
    $ dmhy rm -a
  `)
  .action(function (vids, cmd) {
    if (!vids.length && !cmd.all) {
      this.help()
    } else {
      if (cmd.all) {
        vids = [...db].map(anime => anime.vid)
      }

      for (const vid of vids) {
        const anime = db.query('vid', vid)
        if (anime) {
          console.log('Remove', anime.name)
          db.pop(anime)
        } else {
          console.error(`Not found vid: ${vid}.`)
        }
      }

      db.save()
      process.exit()
    }
  })

program
  .command('download [epid...]')
  .alias('dl')
  .usage('[epid...]')
  .description(`
  Download <episode> of <anime> which are subscribed.

  The epid format: <vid>-<ep>
  <ep> : int | float | 'all' | <ep>..<ep> | <ep>,<ep>

  If only <vid>, means <vid>-all.

  Examples:
    $ dmhy download ABC-01 DEF
    $ dmhy dl XYZ-5.5 QWE-all ZZZ-1,3..5,6,8
  `)
  .action(function (epids) {
    if (!epids.length) {
      this.help()
    } else {
      for (const epid of epids) {
        Promise.all(db.query('epid', epid).map(db.download))
          .then(ok => {
            process.exit(ok)
          })
          .catch(error => {
            process.exit(error)
          })
      }
    }
  })

program
  .command('list [vid]')
  .alias('ls')
  .option('-a, --addable', 'List addable format.')
  .description(`
  List <anime> of <vid> which are subscribed or
  all <anime> are listed if no <vid>.

  Examples:
    $ dmhy list ABC
    $ dmhy ls -a
  `)
  .action(function (vid, cmd) {
    if (cmd.addable) {
      for (const anime of db) {
        console.log([anime.name, ...anime.keywords].join())
      }
    } else if (vid) {
      const anime = db.query('vid', vid)
      if (anime) {
        const episodes = anime.episodes.slice().sort((a, b) => a.ep - b.ep)

        console.log('Name:', anime.name)
        console.log('Addible format:', [anime.name, ...anime.keywords].join(','))
        console.log()
        console.log('Episode | Title')
        for (const episode of episodes) {
          console.log(`${episode.ep.toString().padEnd(7, ' ')} | ${episode.title}`)
        }
      } else {
        console.error('vid:', vid, 'is not found.')
      }
    } else {
      db.list()
    }

    process.exit()
  })

program.parse(process.argv)

for (const anime of db) {
  const kw = [anime.name, ...anime.keywords].join('+')

  axios.get(encodeURI(`https://share.dmhy.org/topics/list?keyword=${kw}`))
    .then(response => {
      if (response.status !== 200) {
        throw new Error(response)
      }
      const $ = cheerio.load(response.data)
      const titleTexts = $('#topic_list tr:nth-child(n+1) .title > a').text()
      const titles = titleTexts.split(/[\n\t]+/).filter(x => x)

      const magnetElements = $('#topic_list tr:nth-child(n+1) a.download-arrow').toArray()
      const magnets = magnetElements.map(x => x.attribs.href)

      if (titles.length !== magnets.length) {
        throw new Error('titles.length !== magnets.length')
      }

      const dmhyEpisodes = titles.map((t, i) => {
        // [01]        => 1
        // [03v2]      => 3
        // [5.5]       => 5.5
        // [第8話]      => 8
        // [24 END]    => 24
        // [MP4] [mp4] => x
        // [V2] [v3]   => x
        // [BIG5] [big5]   => x
        return {
          title: t,
          link: magnets[i],
          ep: parseFloat(t.replace(/.*\[[^\dMPVBIGvmpbig]*(\d{1,2}(?:\.\d+)?)(?:[vV]\d+|\+.*|\D*)?\].*/, '$1'))
        }
      })

      if (dmhyEpisodes.length !== anime.episodes.length) {
        for (const dep of dmhyEpisodes) {
          const existed = anime.episodes.find(episode => episode.ep === dep.ep)
          if (!existed) {
            db.download(dep)
            anime.episodes.push(dep)
          }
        }
      }

      db.save()
    })
    .catch(error => {
      console.error(error)
    })
}
