// '' := normal
const EPISODE_TYPE = new Map([['', 0], ['SP', 1], ['OVA', 2]]);

/**
 * Describe an episode information
 *
 * @class TheEpisode
 */
class TheEpisode {
  /**
   * Creates an instance of TheEpisode.
   * @param {object} info [{ ep = -1, type = '' }={}]
   * @memberof TheEpisode
   */
  constructor({ ep = -1, type = '' } = {}) {
    this.ep = Number.isFinite(Number(ep)) ? Number(ep) : -1;
    type = String(type).toUpperCase();
    this.type = EPISODE_TYPE.has(type) ? type : '';
  }

  /**
   * @return {string} string
   * @memberof TheEpisode
   */
  toString() {
    const ep = this.ep.toString().padStart(2, '0');
    return `${this.type}${ep}`;
  }

  /**
   * @return {boolean} boolean
   * @memberof TheEpisode
   */
  isValid() {
    return this.ep > -1 && EPISODE_TYPE.has(this.type);
  }

  /**
   * Compare function make following order:
   *
   * 1~N ; SP 1~N ; OVA 1~N
   *
   * @static
   * @param {any} a
   * @param {any} b
   * @return {number} number
   * @memberof TheEpisode
   */
  static ascendCompare(a, b) {
    if (a.type !== b.type) {
      return EPISODE_TYPE.get(a.type) - EPISODE_TYPE.get(b.type);
    } else {
      return a.ep - b.ep;
    }
  }

  /**
   * Compare function make following order:
   *
   * N~1 ; SP N~1 ; OVA N~1
   *
   * @static
   * @param {any} a
   * @param {any} b
   * @return  {number} number
   * @memberof TheEpisode
   */
  static descendCompare(a, b) {
    if (a.type !== b.type) {
      return EPISODE_TYPE.get(a.type) - EPISODE_TYPE.get(b.type);
    } else {
      return (a.ep - b.ep) * -1;
    }
  }
}

/**
 * Describe a general episode
 *
 * If multiple episodes included,
 * episodes will be ordered from latest to earliest.
 *
 * @class Episode
 */
class Episode {
  /**
   * Creates an instance of Episode.
   * @param {any} episodeLike
   * @memberof Episode
   */
  constructor(episodeLike) {
    this.episodes = [];

    const one = (epLike) => {
      const ep = new TheEpisode(epLike);
      if (ep.isValid()) {
        this.episodes.push(ep);
      } else {
        throw new TypeError('The constructor parameter should be an array or TheEpisode-like object.');
      }
    };

    if (!Array.isArray(episodeLike)) {
      one(episodeLike);
    } else {
      episodeLike.forEach((epLike) => one(epLike));
    }

    this.episodes.sort(TheEpisode.descendCompare);
  }

  /**
   * @param {function} [sortFunc=TheEpisode.descendCompare]
   * @return {string} string
   * @memberof Episode
   */
  toString(sortFunc = TheEpisode.descendCompare) {
    return this.episodes
      .slice()
      .sort(sortFunc)
      .map((episode) => `${episode}`)
      .join(', ');
  }

  /**
   * @param {any} { ep = -1, type = '' }
   * @return {boolean} boolean
   * @memberof Episode
   */
  has({ ep = -1, type = '' }) {
    return this.episodes
      .filter((episode) => episode.ep === ep)
      .filter((episode) => episode.type === type)
      .length > 0;
  }

  /**
   * @return {boolean} boolean
   * @memberof Episode
   */
  isValid() {
    return this.episodes.every((episode) => episode.isValid());
  }

  /**
   * @readonly
   * @memberof Episode
   */
  get data() {
    return this.episodes;
  }

  /**
   * @static
   * @param {any} [from = -1, to = -1]
   * @param {string} [type='']
   * @return {TheEpisode[]} episodes
   * @memberof Episode
   */
  static rangify([from = -1, to = -1], type = '') {
    if (from > to) {
      [from, to] = [to, from];
    }
    const epList = [];
    for (let ep = from; ep <= to; ep++) {
      epList.push(new TheEpisode({ ep, type }));
    }
    return epList;
  }

  /**
   * @static
   * @param {any} episodeLike
   * @return {boolean} boolean
   * @memberof Episode
   */
  static isValid(episodeLike) {
    if (!Array.isArray(episodeLike)) {
      return new TheEpisode(episodeLike).isValid();
    } else {
      return episodeLike.every((episode) => new TheEpisode(episode).isValid());
    }
  }
}

exports.TheEpisode = TheEpisode;
exports.Episode = Episode;
