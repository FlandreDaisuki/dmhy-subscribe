const os = require('os')
const fs = require('fs')
const semver = require('semver')
const { version } = require('../package.json')
const { Database } = require('../fakedb')
const { Config } = require('../config')

const projectDataDir = `${os.homedir()}/.dmhy-subscribe`
const fakedbFile = `${projectDataDir}/fakedb.json`
const configFile = `${projectDataDir}/config.json`
const versionFile = `${projectDataDir}/.version`

if (!fs.existsSync(projectDataDir)) {
  fs.mkdirSync(projectDataDir)
}

if (!fs.existsSync(versionFile)) {
  fs.writeFileSync(versionFile, version)
}

const upgradeDatabaseFunctions = []
const upgradeConfigFunctions = []

const oldVersion = fs.readFileSync(versionFile, { encoding: 'utf-8' })

if (semver.lt(oldVersion, version)) {
  if (fs.existsSync(configFile)) {
    const cfgObject = JSON.parse(fs.readFileSync(configFile, { encoding: 'utf-8' }))
    const upgraded = upgradeConfigFunctions.reduce((prev, cur) => {
      return cur(prev)
    }, cfgObject)
    fs.writeFileSync(configFile, JSON.stringify(upgraded))
  } else {
    (new Config({ configFile })).save()
  }

  if (fs.existsSync(fakedbFile)) {
    const dbObject = JSON.parse(fs.readFileSync(fakedbFile, { encoding: 'utf-8' }))
    const upgraded = upgradeDatabaseFunctions.reduce((prev, cur) => {
      return cur(prev)
    }, dbObject)
    fs.writeFileSync(fakedbFile, JSON.stringify(upgraded))
  } else {
    (new Database({ dbFile: fakedbFile, config: new Config({ configFile }) })).save()
  }
}
