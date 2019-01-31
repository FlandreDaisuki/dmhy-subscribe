const RssParser = require('rss-parser');
const { Subscription } = require('./dmhy/subscription');
const { Thread } = require('./dmhy/thread');
const { print, l10n } = require('./utils');

const parser = new RssParser();
/**
 * @param {string[]} kws
 * @return {object} rss
 */
function fetchRssFromKeywords(kws) {
  return parser.parseURL(
    `https://share.dmhy.org/topics/rss/rss.xml?sort_id=2&keyword=${kws.map(encodeURIComponent).join('+')}`
  );
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
        return null;
      }
    })
    .filter(Boolean);
}

/**
 * @param {string[]} kws
 * @param {string[]} ukws
 * @return {threadLike[]} threadLikes
 */
async function fetchThreadLikesByKeywords(kws, ukws = []) {
  const threadLikes = (await fetchRssFromKeywords(kws)).items
    .map((item) => ({ title: item.title, link: item.enclosure.url }))
    .filter((th) => !ukws.some((ukw) => th.title.includes(ukw)));

  return threadLikes;
}

exports.fetchThreads = fetchThreads;
exports.fetchThreadLikesByKeywords = fetchThreadLikesByKeywords;
