const fs = require('fs')
const semver = require('semver')
const { version } = require('../package.json')
const { Database } = require('../src/database')
const { Config } = require('../src/config')
const { CONST } = require('../src/utils')
const { defaultConfigPath, defaultDatabasePath, defaultProjectDataDir, defaultVersionPath } = CONST

if (!fs.existsSync(defaultProjectDataDir)) {
  fs.mkdirSync(defaultProjectDataDir)
}

if (!fs.existsSync(defaultVersionPath)) {
  fs.writeFileSync(defaultVersionPath, version)
}

const upgradeDatabaseFunctions = []
const upgradeConfigFunctions = []

const to0$5$x = (db) => {
  if (semver.lt(db.version, '0.5.0') && semver.gte(db.version, '0.4.0')) {
    for (const s of db.subscriptions) {
      for (const th of s.threads) {
        const epSet = [...new Set(th.ep)]
        if (epSet.length === 1) {
          th.episode = { ep: epSet[0], type: '' }
        } else {
          th.episode = epSet.map(ep => ({ ep, type: '' }))
        }
        delete th.ep
      }
    }
    db.version = '0.5.0' // 0.4.x → 0.5.0
  }
  return db
}
upgradeDatabaseFunctions.push(to0$5$x)

// execute upgrade functions
const oldVersion = fs.readFileSync(defaultVersionPath, { encoding: 'utf-8' })

if (semver.lt(oldVersion, version)) {
  if (fs.existsSync(defaultConfigPath)) {
    const cfgObject = JSON.parse(fs.readFileSync(defaultConfigPath, { encoding: 'utf-8' }))
    const upgraded = upgradeConfigFunctions.reduce((prev, cur) => {
      return cur(prev)
    }, cfgObject)
    fs.writeFileSync(defaultConfigPath, JSON.stringify(upgraded))
  } else {
    (new Config(defaultConfigPath)).save()
  }

  if (fs.existsSync(defaultDatabasePath)) {
    const dbObject = JSON.parse(fs.readFileSync(defaultDatabasePath, { encoding: 'utf-8' }))
    const upgraded = upgradeDatabaseFunctions.reduce((prev, cur) => {
      return cur(prev)
    }, dbObject)
    fs.writeFileSync(defaultDatabasePath, JSON.stringify(upgraded))
  }
  const newDb = new Database({ dbPath: defaultDatabasePath, configPath: defaultConfigPath })
  newDb.sort()
  newDb.save()
}
