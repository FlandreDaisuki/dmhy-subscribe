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

module.exports = {
  hash,
  XSet
}
