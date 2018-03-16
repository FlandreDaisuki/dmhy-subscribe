const axios = require('axios')
const cheerio = require('cheerio')
const { Subscription } = require('./dmhy/subscription')
const { Thread } = require('./dmhy/thread')

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
  return (await fetchThreadsByKeyword(kws)).filter(Thread.isValid)
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

  return titles.map((title, i) => new Thread({ title, link: magnets[i] }))
}

function getTitlesFromCheerio ($) {
  return $('#topic_list tr:nth-child(n+1) .title > a')
    .text()
    .split(/[\n\t]+/)
    .filter(_ => _)
}

function getMagnetsFromCheerio ($) {
  return $('#topic_list tr:nth-child(n+1) a.download-arrow')
    .toArray()
    .map(x => x.attribs.href)
}

module.exports = {
  fetchThreads,
  fetchThreadsByKeyword
}
