const axios = require('axios')
const cheerio = require('cheerio')
const { Subscription } = require('./fakedb')
const { getLocaleString: l10n } = require('./utils')

class Thread {
  constructor (title, link) {
    this.title = title
    this.link = link
    this.ep = parseEpisodeFromTitle(title)
  }
}

async function fetchSearchHTML (kws) {
  const response = await axios.get(
    `https://share.dmhy.org/topics/list?keyword=${kws.map(encodeURIComponent).join('+')}`
  )
  if (response.status !== 200) {
    throw new Error(response)
  }
  return response.data
}

async function fetchThreads (subscription) {
  if (!(subscription instanceof Subscription)) {
    throw new TypeError('Parameter should be a Subscription.')
  }
  const kws = [subscription.name, ...subscription.keywords]
  return (await fetchThreadsByKeyword(kws)).filter(t => t.ep.every(isFinite))
}

async function fetchThreadsByKeyword (kws) {
  return parseThreadsFromHTML(await fetchSearchHTML(kws))
}

function parseThreadsFromHTML (html) {
  const $ = cheerio.load(html)
  const titles = getTitlesFromCheerio($)
  const magnets = getMagnetsFromCheerio($)

  if (titles.length !== magnets.length) {
    throw new Error('titles.length !== magnets.length')
  }

  return titles.map((t, i) => new Thread(t, magnets[i]))
}

function getTitlesFromCheerio ($) {
  return $('#topic_list tr:nth-child(n+1) .title > a')
    .text()
    .split(/[\n\t]+/)
    .filter(x => x)
}

function getMagnetsFromCheerio ($) {
  return $('#topic_list tr:nth-child(n+1) a.download-arrow')
    .toArray()
    .map(x => x.attribs.href)
}

function parseEpisodeFromTitle (title) {
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

  function parseRangeEpisode (tok) {
    const [head, tail] = tok
      .trim()
      .split('-')
      .map(parseFloat)
    if (!tail) {
      return [head]
    }
    const rangeEps = []
    for (let i = head; i <= tail; i++) {
      rangeEps.push(i)
    }
    return rangeEps
  }

  // Find episode from last is easier
  for (const token of tokens.reverse()) {
    const tok = token
      .replace(/\s*(end|完)$/, '') // [24 end], [06完]
      .replace(/\s*v\d+$/, '') // [20v2]
      .replace(/(ova|sp)/, '') // [OVA1], [SP02]

    if (/[+]/.test(tok)) {
      return tok
        .split('+')
        .map(parseEpisodeFromTitle)
        .reduce((a, b) => a.concat(b), [])
        .sort((a, b) => a - b)
    }

    if (/(?:\D*|^)([\d.]+)(-[\d.]+)?(?:\D*|$)/.test(tok)) {
      return parseRangeEpisode(tok.replace(/(?:\D*|^)([\d.]+)(-[\d.]+)?(?:\D*|$)/, '$1$2'))
    }
  }

  console.log(l10n('UNHANDLED_EP_PARSING_MSG'))

  console.log('title:', title)
  console.log('tokens:', tokens)
}

module.exports = {
  fetchThreads,
  fetchThreadsByKeyword,
  parseEpisodeFromTitle
}
