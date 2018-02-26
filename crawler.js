const axios = require('axios')
const cheerio = require('cheerio')

async function fetchThreads (subscription) {
  if (subscription.constructor.name !== 'Subscription') {
    throw new TypeError('Parameter should be a Subscription.')
  }
  const kw = [subscription.name, ...subscription.keywords].join('+')
  const response = await axios.get(encodeURI(`https://share.dmhy.org/topics/list?keyword=${kw}`))
  if (response.status !== 200) {
    throw new Error(response)
  }
  return parseThreads(response.data)
}

function parseThreads (html) {
  const $ = cheerio.load(html)
  const titleTexts = $('#topic_list tr:nth-child(n+1) .title > a').text()
  const titles = titleTexts.split(/[\n\t]+/).filter(x => x)

  const magnetElements = $('#topic_list tr:nth-child(n+1) a.download-arrow').toArray()
  const magnets = magnetElements.map(x => x.attribs.href)

  if (titles.length !== magnets.length) {
    throw new Error('titles.length !== magnets.length')
  }

  return titles.map((t, i) => ({
    title: t,
    link: magnets[i],
    ep: parseEpisodeFromTitle(t)
  })).filter(t => t.ep.every(isFinite))
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

  const tokens = title.split(/[[\]【】_\s]/g)
    .map(x => x.toLowerCase())
    .filter(x => /\d/.test(x))
    .filter(x => !blacklistTokenSet.has(x))
    .filter(x => !/(10bit|ma10p)/.test(x))
    .map(x => x.trim())

  function parseRangeEpisode (tok) {
    const [head, tail] = tok.trim().split('-').map(parseFloat)
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

  console.log('This should never print unless having bugs.')
  console.log('Please paste following information to https://github.com/FlandreDaisuki/dmhy-subscribe/issues.')

  console.log('title:', title)
  console.log('tokens:', tokens)
}

module.exports = {
  fetchThreads,
  parseThreads,
  parseEpisodeFromTitle
}
