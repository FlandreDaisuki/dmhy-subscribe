const os = require('os')
const fs = require('fs')
const { systemDownloadsFolder } = require('./utils')

require('console.table')

const DEFAULT_CONFIG = {
  client: 'deluge',
  jsonrpc: '',
  destination: systemDownloadsFolder
}

class Config {
  constructor ({ configFile } = { configFile: `${os.homedir()}/.dmhy-subscribe/config.json` }) {
    this.configPath = configFile
    this.parameters = Object.assign({}, DEFAULT_CONFIG)

    if (!fs.existsSync(this.configPath)) {
      this.reset()
    }
    Object.assign(this.parameters, JSON.parse(fs.readFileSync(this.configPath, 'utf8')))
  }

  save () {
    fs.writeFileSync(this.configPath, JSON.stringify(this.parameters))
  }

  get (key) {
    if (this.isValidKey(key)) {
      return this.parameters[key]
    }
  }

  set (key, value) {
    if (this.isValidKey(key)) {
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
    if (this.isValidKey(key)) {
      this.parameters[key] = DEFAULT_CONFIG[key]
    } else {
      Object.assign(this.parameters, DEFAULT_CONFIG)
    }
    this.save()
  }

  isValidKey (key) {
    return key && Object.keys(DEFAULT_CONFIG).includes(key)
  }
}

module.exports = {
  Config
}
