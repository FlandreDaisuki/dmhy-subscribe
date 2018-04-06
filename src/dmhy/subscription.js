const fs = require('fs-extra');
const path = require('path');
const ymal = require('js-yaml');
const { Thread } = require('./thread');
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
 * Split keywords and unkeywords
 *
 * @param {string} keywords
 * @return {{unkeywords:string[], keywords:string[]}}
 */
function splitKeywords(keywords) {
  const unkeywords = keywords
    .filter((keyword) => /^~.*~$/.test(keyword))
    .map((unkeyword) => unkeyword.replace(/^~(.*)~$/, '$1'));
  return {
    unkeywords,
    keywords: keywords.filter((keyword) => !/^~.*~$/.test(keyword)),
  };
}


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
    } else if (typeof subscribable === 'object' && subscribable.title) {
      // subscriptionLike constructor
      Object.assign(this, subscribable);

      // recheck all
      this.sid = this.sid || null;
      this.keywords = this.keywords || [];
      this.threads = this.threads || [];
      this.unkeywords = this.unkeywords || [];
      this.latest = this.latest || -Infinity;
      this.episodeParser = this.episodeParser || null;
      this.userBlacklistPatterns = this.userBlacklistPatterns || [];
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
