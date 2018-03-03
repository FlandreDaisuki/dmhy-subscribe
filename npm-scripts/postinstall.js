const os = require('os')
const fs = require('fs')
const semver = require('semver')
const { version } = require('../package.json')
const { Database } = require('../fakedb')

const projectDataDir = `${os.homedir()}/.dmhy-subscribe`
const fakedbFile = `${projectDataDir}/fakedb.json`
const versionFile = `${projectDataDir}/.version`

if (!fs.existsSync(projectDataDir)) {
  fs.mkdirSync(projectDataDir)
}

if (!fs.existsSync(versionFile)) {
  fs.writeFileSync(versionFile, version)
}

const upgradeDatabaseFunctions = []

const oldVersion = fs.readFileSync(versionFile, { encoding: 'utf-8' })

if (semver.lt(oldVersion, version)) {
  if (fs.existsSync(fakedbFile)) {
    const dbObject = JSON.parse(fs.readFileSync(fakedbFile, { encoding: 'utf-8' }))
    const upgraded = upgradeDatabaseFunctions.reduce((prev, cur) => {
      return cur(prev)
    }, dbObject)
    fs.writeFileSync(fakedbFile, upgraded)
  } else {
    (new Database({ dbfile: fakedbFile })).save()
  }
}
