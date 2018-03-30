const fs = require('fs')
const path = require('path')
const { console, CONST } = require('./utils')
const { systemDownloadsFolder, defaultConfigPath } = CONST

const DEFAULT_CONFIG = {
  client: 'deluge',
  jsonrpc: '',
  destination: systemDownloadsFolder,
  webhook: 'http://localhost/'
}

class Config {
  constructor (configPath = defaultConfigPath) {
    this.configPath = configPath
    this.parameters = Object.assign({}, DEFAULT_CONFIG)

    if (!fs.existsSync(this.configPath)) {
      this.reset()
    }
    Object.assign(this.parameters, JSON.parse(fs.readFileSync(this.configPath, 'utf8')))

    // parameter checks
    if (!fs.existsSync(this.parameters.destination)) {
      console.warn(`config.destination{${this.parameters.destination}} not found.`)
    }
    if (!Config.isSupportedClient(this.parameters.client)) {
      console.warn(`config.client{${this.parameters.client}} not supported.`)
    }
    this.save()
  }

  save () {
    fs.writeFileSync(this.configPath, JSON.stringify(this.parameters))
  }

  get (key) {
    if (Config.isValidKey(key)) {
      return this.parameters[key]
    }
  }

  set (key, value) {
    if (Config.isValidKey(key)) {
      this.parameters[key] = value
      this.save()
      return { key, value }
    }
  }

  list () {
    const params = Object.entries(this.parameters).map(([key, value]) => ({ Parameter: key, Value: value }))
    console.table(params)
  }

  reset (key = null) {
    if (Config.isValidKey(key)) {
      this.parameters[key] = DEFAULT_CONFIG[key]
    } else {
      Object.assign(this.parameters, DEFAULT_CONFIG)
    }
    this.save()
  }

  static isValidKey (key) {
    return key && Object.keys(DEFAULT_CONFIG).includes(key)
  }

  static isSupportedClient (client) {
    const downloaders = fs.readdirSync(`${__dirname}/downloaders`).map(d => path.basename(d, '.js'))
    return (new Set(downloaders)).has(client)
  }
}

module.exports = {
  Config
}
