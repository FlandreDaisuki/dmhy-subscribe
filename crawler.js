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
    '1280x720',
    '720p',
    '1080p',
    'mp4',
    'big5',
    'v2'
  ])

  const tokens = title.split(/[[\]]/g)
    .map(x => x.toLowerCase())
    .filter(x => /\d/.test(x) && !blacklistTokenSet.has(x))

  for (const token of tokens) {
    const tok = token
      .replace(/\s*(end|完)$/, '') // [24 end], [06完]
      .replace(/\s*v\d+$/, '') // [20v2]
      .replace(/\s*\+.*$/, '') // [20+sp1]
      .replace(/[第話话]/g, '') // [第8話]

    if (/^[\d.]+$/.test(tok)) {
      return [parseFloat(tok)]
    } else if (/^[\d.]+-[\d.]+$/.test(tok)) {
      const [head, tail] = tok.split(/\s*-\s*/).map(parseFloat)
      const rangeEps = []
      for (let i = head; i <= tail; i++) {
        rangeEps.push(i)
      }
      return rangeEps
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
