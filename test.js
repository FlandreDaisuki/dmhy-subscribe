const fs = require('fs')
const { version } = require('./package.json')

const fakedbPath = `${__dirname}/fakedb.json`

function upgradeDatabase3to4 () {
  if (fs.existsSync(fakedbPath)) {
    const olddb = JSON.parse(fs.readFileSync(fakedbPath, 'utf8'))
    if (!olddb.version) {
      const newdb = {
        version,
        subscriptions: []
      }
      for (const oldsubscription of olddb) {
        const newsubscription = {
          sid: oldsubscription.vid,
          name: oldsubscription.name,
          keywords: oldsubscription.keywords,
          latest: -1,
          threads: []
        }

        for (const oldthread of oldsubscription.episodes) {
          newsubscription.threads.push({
            title: oldthread.title,
            link: oldthread.link,
            ep: [].concat(oldthread.ep)
          })
          newsubscription.latest = Math.max(newsubscription.latest, ...[].concat(oldthread.ep))
        }

        newdb.subscriptions.push(newsubscription)
      }
      fs.writeFileSync(fakedbPath, JSON.stringify(newdb))
    }
  }
}

upgradeDatabase3to4()
