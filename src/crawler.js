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
    `https://share.dmhy.org/topics/list?sort_id=2&keyword=${kws.map(encodeURIComponent).join('+')}`
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
  return (await fetchThreadLikesByKeywords(kws, sub.unkeywords))
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
 * @return {threadLike[]} threadLikes
 */
async function fetchThreadLikesByKeywords(kws, ukws = []) {
  const threadLikes = parseThreadLikesFromHTML(await fetchSearchHTML(kws))
    .filter((th) => !ukws.some((ukw) => th.title.includes(ukw)));

  return threadLikes;
}

/**
 *
 *
 * @param {HTML} html
 * @return {threadLike[]} threadLikes
 */
function parseThreadLikesFromHTML(html) {
  const $ = cheerio.load(html);
  const titles = getTitlesFromCheerio($);
  const magnets = getMagnetsFromCheerio($);

  if (titles.length !== magnets.length) {
    throw new Error('titles.length !== magnets.length');
  }

  return titles
    .map((title, i) => ({ title, link: magnets[i] }));
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
exports.fetchThreadLikesByKeywords = fetchThreadLikesByKeywords;
