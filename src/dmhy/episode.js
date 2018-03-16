// '' := Regular
const EPISODE_TYPE = new Map([['', 0], ['SP', 1], ['OVA', 2]])

class Episode {
  constructor ({ ep, type } = {}) {
    this.ep = Number.isFinite(Number(ep)) ? Number(ep) : -1
    type = String(type).toUpperCase()
    this.type = EPISODE_TYPE.has(type) ? type : ''
  }

  toString () {
    const ep = this.ep.toString().padStart(2, '0')
    return `${this.type}${ep}`
  }

  has (ep, type = '') {
    return this.ep === ep && this.type === type
  }

  isValid () {
    return this.ep >= 0
  }

  get head () { return this }
  get tail () { return this }

  static ascendCompare (a, b) {
    // 1..N
    // SP 1..N
    // OVA 1..N

    if (a.type !== b.type) {
      return EPISODE_TYPE.get(a.type) - EPISODE_TYPE.get(b.type)
    } else {
      return a.ep - b.ep
    }
  }

  static descendCompare (a, b) {
    // N..1
    // SP N..1
    // OVA N..1
    if (a.type !== b.type) {
      return EPISODE_TYPE.get(a.type) - EPISODE_TYPE.get(b.type)
    } else {
      return (a.ep - b.ep) * -1
    }
  }

  static rangify ([from, to], type = '') {
    if (from > to) {
      [from, to] = [to, from]
    }
    const epList = []
    for (let ep = from; ep <= to; ep++) {
      epList.push(new Episode({ ep, type }))
    }
    return epList
  }

  static isValid (episode) {
    return episode.ep >= 0
  }
}

class ComplexEpisode {
  constructor (episodes) {
    if (!Array.isArray(episodes)) {
      throw new TypeError('The constructor parameter should be an array.')
    }
    this.episodes = episodes
      .filter(episode => episode instanceof Episode)
      .sort(Episode.descendCompare) // [latest ... earliest]
  }

  toString (sortFunc = Episode.descendCompare) {
    return this.episodes
      .slice()
      .sort(sortFunc)
      .map(episode => `${episode}`)
      .join(', ')
  }

  has (ep, type = '') {
    return this.episodes.find(x => x.ep === ep && x.type === type)
  }

  isValid () {
    return this.episodes.every(Episode.isValid)
  }

  get head () { return this.episodes[0] }
  get tail () { return this.episodes[this.episodes.length - 1] }

  static isValid (episode) {
    return episode.episodes.every(Episode.isValid)
  }
}

function ascendEpisodeCompare (a, b) {
  const _valid = [a, b].every(x => x instanceof ComplexEpisode || x instanceof Episode)
  if (!_valid) {
    throw new TypeError('The parameters should be Episode or ComplexEpisode.')
  }
  const _a = (a instanceof ComplexEpisode) ? a.head : a
  const _b = (b instanceof ComplexEpisode) ? b.head : b
  return Episode.ascendCompare(_a, _b)
}

function descendEpisodeCompare (a, b) {
  const _valid = [a, b].every(x => x instanceof ComplexEpisode || x instanceof Episode)
  if (!_valid) {
    throw new TypeError('The parameters should be Episode or ComplexEpisode.')
  }
  const _a = (a instanceof ComplexEpisode) ? a.head : a
  const _b = (b instanceof ComplexEpisode) ? b.head : b
  return Episode.descendCompare(_a, _b)
}

module.exports = {
  Episode,
  ComplexEpisode,
  ascendEpisodeCompare,
  descendEpisodeCompare
}
