const os = require('os')
const fs = require('fs')

const DEFAULT_CONFIG = {
  client: 'deluge',
  jsonrpc: ''
}

class Config {
  constructor ({ configFile } = { configFile: `${os.homedir()}/.dmhy-subscribe/config.json` }) {
    this.configPath = configFile
    this.variables = Object.assign({}, DEFAULT_CONFIG)

    if (!fs.existsSync(this.configPath)) {
      this.reset()
    }
    Object.assign(this.variables, JSON.parse(fs.readFileSync(this.configPath, 'utf8')))
  }

  save () {
    fs.writeFileSync(this.configPath, JSON.stringify(this.variables))
  }

  get (key) {
    return this.variables[key]
  }

  set (key, value) {
    if (Object.keys(DEFAULT_CONFIG).includes(key)) {
      this.variables[key] = value
      this.save()
    } else {
      console.error('Invalid key:', key)
    }
  }

  list () {
    console.log(JSON.stringify(this.variables, null, '  '))
  }

  reset (key = null) {
    if (key) {
      this.variables[key] = DEFAULT_CONFIG[key]
    } else {
      Object.assign(this.variables, DEFAULT_CONFIG)
    }
    this.save()
  }
}

module.exports = {
  Config
}
