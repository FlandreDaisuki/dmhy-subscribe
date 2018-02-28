const os = require('os')
const { statSync } = require('fs')
const { execSync } = require('child_process')

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

module.exports = {
  hash,
  XSet,
  systemDownloadsFolder
}
