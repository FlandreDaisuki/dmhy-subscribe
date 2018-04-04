const fs = require('fs');
const path = require('path');
const ymal = require('js-yaml');
const { Thread } = require('./thread');
// const { Episode } = require('./episode');
const { print, hash, XSet } = require('../utils');
const { SubscriptionError } = require('../errors');

const SUPPORT_FORMAT = new Set(['.yml', '.yaml']);

/**
 * @param {string} s
 * @return {?RegExp} result
 */
function strToRegexp(s) {
  if (/^\/.*\/\w*$/.test(s)) {
    const [, pattern, flag] = s.match(/^\/(.*)\/(\w*)$/);
    return new RegExp(pattern, flag);
  }
  return null;
}

/**
 * Describe a Subscription
 *
 * @class Subscription
 */
class Subscription {
  /**
   * Creates an instance of Subscription.
   * @param {any} subscribable
   * @memberof Subscription
   */
  constructor(subscribable) {
    this.threads = [];
    this.episodeParser = null;
    this.userBlacklistPatterns = [];

    if (typeof subscribable === 'string') {
      const { ext } = path.parse(subscribable);
      if (SUPPORT_FORMAT.has(ext)) {
        const loaded = this.loadMetaFromFile(path.resolve(subscribable));
        const { title, keywords, sid, latest } = loaded;
        if (loaded.episodeParser) {
          this.episodeParser = strToRegexp(loaded.episodeParser);
        }
        if (loaded.userBlacklistPatterns.length) {
          this.userBlacklistPatterns = loaded.userBlacklistPatterns
            .map((ubp) => strToRegexp(ubp))
            .filter((_) => _);
        }
        Object.assign(this, { title, keywords, sid, latest });
      } else if (!ext || subscribable.includes(',')) {
        [this.title, ...this.keywords] = subscribable.split(',');
        if (!this.title) {
          throw new SubscriptionError('Subscribable string must have title');
        }
        this.keywords.sort();
        this.sid = null;
        this.latest = -Infinity; // last episode of threads
      } else {
        throw new SubscriptionError(`Unknown subscribable: "${subscribable}"`);
      }
    }
  }

  /**
   * @param {string} [subscribable='']
   * @return {object} data
   * @memberof Subscription
   */
  loadMetaFromFile(subscribable = '') {
    const { ext } = path.parse(subscribable);
    try {
      if (ext === '.yml' || ext === '.yaml') {
        return ymal.safeLoad(fs.readFileSync(subscribable, 'utf-8'));
      } else {
        throw new SubscriptionError(`Unknown file extension: ${ ext }`);
      }
    } catch (error) {
      print.error(error);
    }
  }

  /**
   * Sort subscription threads from latest to earlist.
   *
   * @memberof Subscription
   */
  sort() {
    this.threads.sort((a, b) => b.head.ep - a.head.ep);
    if (this.threads[0]) {
      this.latest = this.threads[0].head.ep;
    }
  }


  /**
   * @typedef threadLike
   * @property {string} title
   * @property {string} link
   */

  /**
   * @param {threadLike[]} [threadLikes=[]]
   * @memberof Subscription
   */
  loadThreads(threadLikes = []) {
    threadLikes.forEach((threadLike) => {
      const thread = new Thread(threadLike);
      if (thread.isValid()) {
        this.threads.push(thread);
      }
    });
    this.sort();
  }

  /**
   * @param {threadLike} threadLike
   * @memberof Subscription
   */
  add(threadLike) {
    const thread = new Thread(threadLike);
    if (thread.isValid()) {
      this.threads.push(thread);
      this.sort();
    } else {
      throw new SubscriptionError('Invalid thread to add');
    }
  }

  /**
   * @param {Iterable.<string>} existedSids
   * @memberof Subscription
   */
  generateSid(existedSids) {
    const existed = new Set(existedSids);
    if (existed.some((sid) => !/[A-Z]{3}/.test(sid))) {
      throw new SubscriptionError('The parameter should be an iterable of SID');
    }
    this.sid = hash(this.name, this.keywords.join(','));
    while (existed.has(this.sid)) {
      this.sid = hash(this.name, this.sid);
    }
  }

  // list() {
  //   const subscribable = [this.name, ...this.keywords].join(',');
  //   console.log(subscribable);
  //   console.log('='.repeat(subscribable.length));
  //   console.log();
  //   const threads = this.threads.map((th) => {
  //     return {
  //       Episodes: th.episode.toString(Episode.ascendCompare),
  //       Title: th.title,
  //     };
  //   });
  //   console.table(threads.slice().reverse()); // ascend
  // }

  /**
   * @param {string} epstr
   * @return {Thread[]} threads
   * @memberof Subscription
   */
  getThreads(epstr = '') {
    if (!epstr || epstr === 'all') {
      return this.threads;
    }

    const episodeLikes = Subscription.parseEpisodeStringToEpisodeLike(epstr);

    return episodeLikes.filter((epidodeLike) => {
      return this.threads.find((thread) => thread.episode.has(epidodeLike));
    });
  }

  /**
   * @typedef episodeLike
   * @property {string} ep
   * @property {string} type
   */

  /**
   * @static
   * @param {string} epstr
   * @return {episodeLike|episodeLike[]} episodeLikes
   * @memberof Subscription
   */
  static parseEpisodeStringToEpisodeLike(epstr) {
    const collection = new XSet();
    const eptoks = epstr.split(',');
    for (const eptok of eptoks) {
      let type = '';
      if (/^(sp|ova)/i.test(eptok)) {
        type = eptok.replace(/^(sp|ova).*/i, '$1');
      }
      const eptokNoType = eptok.replace(/^(?:sp|ova)?(.*)/i, '$1');
      const ep = Number(eptokNoType);
      if (isFinite(ep)) {
        collection.unionWith([{ ep, type }]);
      } else {
        const [epi, epj] = eptokNoType
          .split(/\.{2,}/)
          .map(Number)
          .sort((a, b) => a - b);
        for (let idx = epi; idx <= epj; idx += 0.5) {
          collection.unionWith([{ ep: idx, type }]);
        }
      }
    }
    return [...collection];
  }
}

exports.Subscription = Subscription;
