const axios = require('axios');
const cheerio = require('cheerio');
const { Subscription } = require('./dmhy/subscription');
const { Thread } = require('./dmhy/thread');
const { print, l10n } = require('./utils');

/**
 * @param {string[]} kws
 * @return {HTML} axios data
 */
async function fetchSearchHTML(kws) {
  const response = await axios.get(
    `https://share.dmhy.org/topics/list?keyword=${kws.map(encodeURIComponent).join('+')}`
  );
  if (response.status !== 200) {
    throw new Error(response);
  }
  return response.data;
}

/**
 * @param {any} sub
 * @return {Thread[]} threads
 */
async function fetchThreads(sub) {
  if (!(sub instanceof Subscription)) {
    throw new TypeError('Parameter should be a Subscription.');
  }
  const kws = [sub.title, ...sub.keywords];
  return (await fetchThreadsByKeywords(kws, sub.unkeywords))
    .map((th) => {
      try {
        return new Thread(th, sub.episodeParser);
      } catch (error) {
        print.warn(l10n('THREAD_EPISODEPARSER_FALLBACK', { sid: sub.sid, title: th.title }));
        return new Thread(th);
      }
    });
}

/**
 * @param {string[]} kws
 * @param {string[]} ukws
 * @return {Thread[]} threads
 */
async function fetchThreadsByKeywords(kws, ukws = []) {
  return parseThreadsFromHTML(await fetchSearchHTML(kws))
    .filter((th) => !ukws.some((ukw) => th.title.includes(ukw)));
}

/**
 *
 *
 * @param {HTML} html
 * @return {Thread[]} threads
 */
function parseThreadsFromHTML(html) {
  const $ = cheerio.load(html);
  const titles = getTitlesFromCheerio($);
  const magnets = getMagnetsFromCheerio($);

  if (titles.length !== magnets.length) {
    throw new Error('titles.length !== magnets.length');
  }

  return titles
    .map((title, i) => new Thread({ title, link: magnets[i] }))
    .filter((th) => th.isValid());
}

/**
 * @param {cheerio} $
 * @return {string[]} titles
 */
function getTitlesFromCheerio($) {
  return $('#topic_list tr:nth-child(n+1) .title > a')
    .text()
    .split(/[\n\t]+/)
    .filter((_) => _);
}

/**
 * @param {cheerio} $
 * @return {string[]} links
 */
function getMagnetsFromCheerio($) {
  return $('#topic_list tr:nth-child(n+1) a.download-arrow')
    .toArray()
    .map((x) => x.attribs.href);
}

exports.fetchThreads = fetchThreads;
exports.fetchThreadsByKeywords = fetchThreadsByKeywords;
