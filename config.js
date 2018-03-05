const os = require('os')
const fs = require('fs')

const DEFAULT_CONFIG = {
  client: 'deluge',
  jsonrpc: ''
}

class Config {
  constructor ({ configFile } = { configFile: `${os.homedir()}/.dmhy-subscribe/config.json` }) {
    this.configPath = configFile

    if (!fs.existsSync(this.configPath)) {
      Object.assign(this, DEFAULT_CONFIG)
      this.save()
    }
    Object.assign(this, JSON.parse(fs.readFileSync(this.configPath, 'utf8')))
  }

  save () {
    const sav = Object.assign({}, this)
    delete sav.configPath
    fs.writeFileSync(this.configPath, JSON.stringify(sav))
  }

  get (key) {
    return this[key]
  }

  set (key, value) {
    this[key] = value
    this.save()
  }
}

module.exports = {
  Config
}
