const os = require('os')
const { statSync, existsSync } = require('fs')
const { execSync, spawnSync } = require('child_process')

class XSet extends Set {
  isSuperset (subset) {
    for (var elem of subset) {
      if (!this.has(elem)) {
        return false
      }
    }
    return true
  }

  union (setB, self = false) {
    var union = new XSet(this)
    for (var elem of setB) {
      (self ? this : union).add(elem)
    }
    return union
  }

  // intersection (setB) {
  //   var intersection = new XSet()
  //   for (var elem of setB) {
  //     if (this.has(elem)) {
  //       intersection.add(elem)
  //     }
  //   }
  //   return intersection
  // }

  // difference (setB) {
  //   var difference = new XSet(this)
  //   for (var elem of setB) {
  //     difference.delete(elem)
  //   }
  //   return difference
  // }
}

function hash (str, seed = '') {
  return Buffer.from(str + seed).toString('base64')
    .replace(/[\W\d]/g, '')
    .toUpperCase()
    .slice(-3)
    .split('')
    .reverse()
    .join('')
}

// Modified from https://github.com/juliangruber/downloads-folder
const systemDownloadsFolder = (() => {
  function darwin () {
    return `${process.env.HOME}/Downloads`
  }

  function windows () {
    return `${process.env.USERPROFILE}/Downloads`
  }

  function unix () {
    let dir
    try {
      dir = execSync('xdg-user-dir DOWNLOAD', { encoding: 'utf-8', stdio: ['ignore', 'pipe', 'ignore'] })
    } catch (_) { /**/ }
    if (dir) return dir.trim()

    let stat
    const homeDownloads = `${process.env.HOME}/Downloads`
    try {
      stat = statSync(homeDownloads)
    } catch (_) { /**/ }
    if (stat) return homeDownloads

    return '/tmp'
  }

  return {
    darwin: darwin,
    freebsd: unix,
    linux: unix,
    sunos: unix,
    win32: windows
  }[os.platform()]()
})()

// Modified from https://github.com/sindresorhus/os-locale
const systemLocale = ((env) => {
  const LOCALEID = {
    // https://zh.wikipedia.org/wiki/地區設定
    '0804': 'zh_CN',
    '20804': 'zh_CN',
    '0404': 'zh_TW',
    '30404': 'zh_TW',
    '0C04': 'zh_HK'
  }

  function unix () {
    return (env.LC_ALL || env.LC_MESSAGES || env.LANG || env.LANGUAGE).replace(/[.].*$/, '')
  }

  function windows () {
    const x = spawnSync('wmic', ['os', 'get', 'locale'], { encoding: 'utf-8' })
    if (x.status === 0) {
      const lcid = x.stdout.replace('Locale', '').trim()
      return LOCALEID[lcid]
    }
    return ''
  }

  const localeName = {
    freebsd: unix,
    linux: unix,
    sunos: unix,
    win32: windows
  }[os.platform()]() || 'en_US'

  const [lang, territory] = localeName.split('_')

  return { lang, territory }
})(process.env)

const getLocaleString = (() => {
  const candidates = [
    `${__dirname}/locale/en.js`,
    `${__dirname}/locale/${systemLocale.lang}.js`,
    `${__dirname}/locale/${systemLocale.lang}_${systemLocale.territory}.js`
  ]

  const dict = candidates.reduce((prev, cur) => {
    if (existsSync(cur)) {
      return Object.assign(prev, require(cur))
    }
    return prev
  }, {})

  return (key, placeholder = {}) => {
    return Object.entries(placeholder).reduce((prev, cur) => {
      return prev.replace(`%${cur[0]}%`, cur[1])
    }, dict[key])
  }
})()

module.exports = {
  hash,
  XSet,
  systemDownloadsFolder,
  getLocaleString
}
