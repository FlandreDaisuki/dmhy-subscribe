const fs = require('fs-extra');
const path = require('path');
const ymal = require('js-yaml');
const { Thread } = require('./thread');
const { l10n, print, hash, XSet, strToRegexp, splitKeywords } = require('../utils');
const { SubscriptionError } = require('../errors');

const SUPPORT_FORMAT = new Set(['.yml', '.yaml']);

/**
 * Describe a Subscription
 *
 * @class Subscription
 * @member {string} sid
 * @member {string} title
 * @member {string[]} keywords
 * @member {string[]} unkeywords
 * @member {Number} latest
 * @member {Thread[]} threads
 * @member {RegExp} episodeParser
 * @member {RegExp[]} userBlacklistPatterns
 */
class Subscription {
  /**
   * Creates an instance of Subscription.
   * @param {any} subscribable
   * @memberof Subscription
   */
  constructor(subscribable) {
    Object.assign(this, {
      sid: null,
      keywords: [],
      unkeywords: [],
      latest: -Infinity,
      threads: [],
      episodeParser: null,
      userBlacklistPatterns: [],
    });

    if (typeof subscribable === 'string') {
      const { ext } = path.parse(subscribable);
      if (SUPPORT_FORMAT.has(ext)) {
        const loaded = this.loadMetaFromFile(path.resolve(subscribable));
        let { title, keywords, unkeywords, sid, latest } = loaded;

        if (!title) {
          throw new SubscriptionError('Subscribable file must have title');
        }

        keywords = keywords || [];
        unkeywords = unkeywords || [];
        sid = sid || null;
        latest = latest || -Infinity;

        if (loaded.episodeParser) {
          this.episodeParser = strToRegexp(loaded.episodeParser);
        }

        if (loaded.userBlacklistPatterns && loaded.userBlacklistPatterns.length) {
          this.userBlacklistPatterns = loaded.userBlacklistPatterns
            .map((ubp) => strToRegexp(ubp))
            .filter((_) => _);
        }
        Object.assign(this, { title, keywords, unkeywords, sid, latest });
      } else if (!ext || subscribable.includes(',')) {
        [this.title, ...this.keywords] = subscribable.split(',');
        if (!this.title) {
          throw new SubscriptionError('Subscribable string must have title');
        }
        const spilts = splitKeywords(this.keywords);
        this.keywords = spilts.keywords;
        this.unkeywords = spilts.unkeywords;

        this.sid = null;
        this.latest = -Infinity; // last episode of threads
      } else {
        throw new SubscriptionError(`Unknown subscribable: "${subscribable}"`);
      }
    }

    this.keywords.sort();
    this.unkeywords.sort();
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
      let thread;
      try {
        thread = new Thread(threadLike, this.episodeParser);
      } catch (error) {
        print.warn(l10n('THREAD_EPISODEPARSER_FALLBACK', { sid: this.sid }));
        print.warn(threadLike.title);
        thread = new Thread(threadLike);
      }
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
    const thread = new Thread(threadLike, this.episodeParser);
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
    if ([...existed].some((sid) => !/[A-Z]{3}/.test(sid))) {
      throw new SubscriptionError('The parameter should be an iterable of SID');
    }
    this.sid = hash(this.name, this.keywords.join(','));
    while (existed.has(this.sid)) {
      this.sid = hash(this.name, this.sid);
    }
  }

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

    return episodeLikes.map((epidodeLike) => {
      return this.threads.find((thread) => thread.episode.has(epidodeLike));
    }).filter((_) => _);
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

  /**
   * Like Array.from
   *
   * @static
   * @param {any} [subscriptionLike={}]
   * @return {Subscription} subscription
   * @memberof Subscription
   */
  static from(subscriptionLike = {}) {
    const sl = subscriptionLike;
    if (!sl.title) {
      throw new Error('Subscription need title');
    }
    const sub = new Subscription(sl.title);

    // recheck all
    sub.sid = sl.sid || null;
    sub.keywords = sl.keywords || [];
    sub.threads = sl.threads || [];
    sub.unkeywords = sl.unkeywords || [];
    sub.latest = sl.latest || -Infinity;
    sub.episodeParser = sl.episodeParser || null;
    sub.userBlacklistPatterns = sl.userBlacklistPatterns || [];

    if (this.episodeParser && typeof this.episodeParser === 'string') {
      this.episodeParser = strToRegexp(this.episodeParser);
    }

    if (this.userBlacklistPatterns && this.userBlacklistPatterns.length) {
      this.userBlacklistPatterns = this.userBlacklistPatterns
        .map((ubp) => (typeof ubp === 'string') ? strToRegexp(ubp) : ubp)
        .filter((_) => _);
    }

    return sub;
  }
}

exports.Subscription = Subscription;
