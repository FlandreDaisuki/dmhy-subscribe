const {
  Episode,
  ComplexEpisode
} = require('./episode')

const { console, l10n } = require('../utils')

class Thread {
  constructor ({ title, link }) {
    this.title = title || '???'
    this.link = link || 'magnet:'
    this.episode = Thread.parseEpisodeFromTitle(this.title)
  }

  static parseEpisodeFromTitle (title) {
    const blacklistTokenSet = new Set([
      '1920x1080',
      '1280x720',
      '1080p',
      '720p',
      'x264',
      'x265',
      '10bit',
      'ma10p',
      'mp4',
      'big5',
      'v2'
    ])

    const tokens = title
      .split(/[[\]【】_\s]/g)
      .map(x => x.toLowerCase())
      .filter(x => /\d/.test(x))
      .filter(x => !blacklistTokenSet.has(x))
      .filter(x => !/(10bit|ma10p)/.test(x))
      .map(x => x.trim())

    // Find episode from last is easier
    for (const token of tokens.reverse()) {
      const tok = token
        .replace(/\s*(end|完)$/, '') // [24 end], [06完]
        .replace(/\s*v\d+$/, '') // [20v2]

      if (/[+]/.test(tok)) {
        const eps = tok
          .split('+')
          .map(Thread.parseEpisodeFromTitle)
          .reduce((a, b) => a.concat(b), [])
        return new ComplexEpisode(eps)
      }
      let type = ''
      if (tokens.some(tok => /(ova|sp)/.test(tok))) {
        type = tok.match(/(ova|sp)/)[0]
      }

      if (/(?:\D*|^)([\d.]+)(-[\d.]+)?(?:\D*|$)/.test(tok)) {
        return parseRangeEpisode(tok, type)
      }
    }

    // input [\d.]+-[\d.]+
    function parseRangeEpisode (tok, type) {
      const str = tok.replace(/(?:\D*|^)([\d.]+)(-[\d.]+)?(?:\D*|$)/, '$1$2')
      const [from, to] = str.split('-').map(t => parseFloat(t))
      if (to === undefined) {
        return new Episode({ ep: from, type })
      }
      return new ComplexEpisode(Episode.rangify([from, to], type))
    }

    console.warn(l10n('UNHANDLED_EP_PARSING_MSG'))
    console.log('==========')
    console.log('title:', `"${title}"`)
    console.log('tokens:', tokens)
  }

  static isValid (thread) {
    return thread.episode.isValid() && thread.title && thread.link
  }
}

module.exports = {
  Thread
}
