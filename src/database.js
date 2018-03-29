const fs = require('fs')
const path = require('path')
const { spawn } = require('child_process')
const { CONST, console } = require('./utils')
const { defaultDatabasePath, defaultConfigPath, packageVersion } = CONST
const { Subscription } = require('./dmhy/subscription')
const { Config } = require('./config')

class Database {
  constructor ({ dbPath, configPath } = { dbPath: defaultDatabasePath, configPath: defaultConfigPath }) {
    this.fakedbPath = dbPath
    this.config = new Config(configPath)
    if (!fs.existsSync(dbPath)) {
      const empty = {
        version: packageVersion,
        subscriptions: []
      }
      fs.writeFileSync(dbPath, JSON.stringify(empty))
    }
    const fakedb = JSON.parse(fs.readFileSync(this.fakedbPath, 'utf8'))
    this.subscriptions = fakedb.subscriptions.map(s => new Subscription(s))
    this.version = packageVersion
  }

  add (subscription) {
    if (!(subscription instanceof Subscription)) {
      throw new TypeError('Parameter should be a Subscription.')
    }
    subscription.generateSid(this.subscriptions.map(s => s.sid))
    this.subscriptions.push(subscription)
    return true
  }

  remove (subscription) {
    if (!(subscription instanceof Subscription)) {
      throw new TypeError('Parameter should be a Subscription.')
    }
    const index = this.subscriptions.findIndex(elem => {
      return elem.sid === subscription.sid
    })
    if (index >= 0) {
      this.subscriptions.splice(index, 1)
      return true
    }
    return false
  }

  save () {
    const sav = {
      version: this.version,
      subscriptions: this.subscriptions
    }
    fs.writeFileSync(this.fakedbPath, JSON.stringify(sav))
  }

  list () {
    const subList = this.subscriptions.map(s => {
      const latest = s.latest > 0 ? s.latest.toString().padStart(2, '0') : '--'
      return {
        sid: s.sid,
        latest,
        name: s.name
      }
    })
    console.table(subList)
  }

  download (thread, { client, destination, jsonrpc, webhook } = {}) {
    client = client || this.config.get('client')
    jsonrpc = jsonrpc || this.config.get('jsonrpc')
    destination = destination || this.config.get('destination')
    webhook = webhook || this.config.get('webhook')

    const script = path.resolve(`${__dirname}/downloaders/${client}.js`)
    const args = [thread, { destination, jsonrpc, webhook }].map(JSON.stringify)
    args.unshift(script)

    return new Promise((resolve, reject) => {
      const task = spawn('node', args, {
        stdio: 'inherit'
      })
      task.on('close', code => {
        if (code === 0) resolve(code)
        else reject(code)
      })
      task.on('error', err => reject(err))
    })
  }

  has (key, value) {
    const results = this.subscriptions.filter(s => s[key] === value)
    return !!results.length
  }

  query (key, value) {
    const results = this.subscriptions.filter(s => s[key] === value)
    return results[0] || null
  }

  sort () {
    this.subscriptions.forEach(s => s.sort())
    this.subscriptions.sort((a, b) => b.latest - a.latest)
  }
}

module.exports = {
  Database
}
