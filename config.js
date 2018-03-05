const os = require('os')
const fs = require('fs')

const DEFAULT_CONFIG = {
  client: 'deluge',
  jsonrpc: ''
}

class Config {
  constructor ({ configfile } = { configfile: `${os.homedir()}/.dmhy-subscribe/config.json` }) {
    this.configfile = configfile

    if (!fs.existsSync(this.configfile)) {
      this.writeConfig(DEFAULT_CONFIG)
    }

    this.readConfig()
  }
  writeConfig (config = this.config) {
    fs.writeFileSync(this.configfile, JSON.stringify(config))
  }
  readConfig () {
    this.config = JSON.parse(fs.readFileSync(this.configfile, 'utf8'))
  }
  get (path) {
    return path
      .replace(/\[([^[\]]*)\]/g, '.$1.')
      .split('.')
      .filter(t => t !== '')
      .reduce((prev, cur) => prev && prev[cur], this.config)
  }
  set (path, value) {
    const paths = path
      .replace(/\[([^[\]]*)\]/g, '.$1.')
      .split('.')
      .filter(t => t !== '')
    function _set (paths, cur) {
      const pname = paths.shift()
      if (paths.length === 0) {
        cur[pname] = value
      } else {
        if (!cur.hasOwnProperty(pname))cur[pname] = {}
        _set(paths, cur[pname])
      }
    }
    _set(paths, this.config)

    this.writeConfig(this.config)
  }
}
module.exports = new Config()
exports.Config = Config
exports.DEFAULT_CONFIG = DEFAULT_CONFIG
