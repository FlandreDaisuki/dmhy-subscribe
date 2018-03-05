const os = require('os')
const fs = require('fs')

const DEFAULT_CONFIG = {
  client: 'deluge',
  jsonrpc: ''
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
    return this.parameters[key]
  }

  set (key, value) {
    if (Object.keys(DEFAULT_CONFIG).includes(key)) {
      this.parameters[key] = value
      this.save()
    } else {
      console.error('Invalid key:', key)
    }
  }

  list () {
    console.log(JSON.stringify(this.parameters, null, '  '))
  }

  reset (key = null) {
    if (key) {
      this.parameters[key] = DEFAULT_CONFIG[key]
    } else {
      Object.assign(this.parameters, DEFAULT_CONFIG)
    }
    this.save()
  }
}

module.exports = {
  Config
}
