const { console, hash, XSet } = require('../utils')
const { Thread } = require('./thread')
const { Episode } = require('./episode')
const { InvalidThreadError } = require('../errors')

class Subscription {
  constructor (subscribable) {
    if (typeof subscribable === 'string') {
      [this.name, ...this.keywords] = subscribable.split(',')
      this.keywords.sort()
      this.sid = null
      this.threads = []
      this.latest = -Infinity // last episode of threads
    } else if (subscribable instanceof Object) {
      // ctor from json
      Object.assign(this, subscribable)
      this.threads = this.threads.map(th => new Thread(th))
    }
  }

  sort () {
    this.threads.sort((a, b) => b.episode.head.ep - a.episode.head.ep) // [latest ... earliest]
    if (this.threads[0]) {
      this.latest = this.threads[0].episode.head.ep
    }
  }

  add (thread) {
    if (thread instanceof Thread && Thread.isValid(thread)) {
      this.threads.push(thread)
      this.sort()
    } else {
      throw new InvalidThreadError()
    }
  }

  generateSid (existedSids) {
    if (!Array.isArray(existedSids)) {
      throw new TypeError('The parameter should be an array.')
    }
    const existed = new Set(existedSids)
    this.sid = hash(this.name, this.keywords.join(','))
    while (existed.has(this.sid)) {
      this.sid = hash(this.name, this.sid)
    }
  }

  list () {
    const subscribable = [this.name, ...this.keywords].join(',')
    console.log(subscribable)
    console.log('='.repeat(subscribable.length))
    console.log()
    const threads = this.threads.map(th => {
      return {
        Episodes: th.episode.toString(Episode.ascendCompare),
        Title: th.title
      }
    })
    console.table(threads.slice().reverse()) // ascend
  }

  getThreads (epstr) {
    if (!epstr || epstr === 'all') {
      return this.threads
    }

    const collection = new XSet()
    const eptoks = epstr.split(',')
    for (const eptok of eptoks) {
      let type = ''
      if (/^(sp|ova)/i.test(eptok)) {
        type = eptok.replace(/^(sp|ova).*/i, '$1')
      }
      const eptokNoType = eptok.replace(/^(?:sp|ova)?(.*)/i, '$1')
      const ep = Number(eptokNoType)
      if (isFinite(ep)) {
        collection.union(this.threads.filter(th => th.episode.has(ep, type)), true)
      } else {
        const [epi, epj] = eptokNoType
          .split(/\.{2,}/)
          .map(Number)
          .sort((a, b) => a - b)
        // this.threads := [latest ... earliest]
        const headIdx = this.threads.findIndex(th => th.episode.has(epj, type))
        const tailIdx = this.threads.findIndex(th => th.episode.has(epi, type))
        collection.union(this.threads.slice(headIdx, tailIdx + 1), true)
      }
    }
    return [...collection]
  }
}

module.exports = {
  Subscription
}
