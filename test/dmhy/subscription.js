const assert = require('assert');
const { Subscription, Thread, TheEpisode } = require('../..');

describe('dmhy/subscription', () => {
  it('Subscription ctor', () => {
    assert.throws(() => new Subscription(''), Error);
    assert.throws(() => new Subscription('a.png'), Error);
    assert.throws(() => new Subscription(',,,'), Error);

    const camp = new Subscription(`${__dirname}/../subscribables/camp.yml`);
    assert.equal(camp.title, '搖曳露營');
    assert.deepEqual(camp.keywords, ['喵萌', '繁體'].sort());
    assert.deepEqual(camp.unkeywords, ['合集'].sort());
    assert.deepEqual(camp.episodeParser, /第\s*(\d+(?:-\d+)?)\s*[話话]/);
    assert.deepEqual(camp.userBlacklistPatterns, [/\d+月\d+日/, /\d+\s*月新番/]);

    const good = new Subscription(`${__dirname}/../subscribables/good.yml`);
    assert.equal(good.title, '牙鬥獸娘');
    assert.deepEqual(good.keywords, []);
    assert.deepEqual(good.unkeywords, []);
    assert.equal(good.episodeParser, null);
    assert.deepEqual(good.userBlacklistPatterns, []);

    assert.throws(() => new Subscription(`${__dirname}/bad.yml`), Error);

    const killingbites = new Subscription('牙鬥獸娘,BIG5');
    assert.equal(killingbites.title, '牙鬥獸娘');
    assert.deepEqual(killingbites.keywords, ['BIG5']);

    const camp2 = new Subscription('搖曳露營');
    assert.equal(camp2.title, '搖曳露營');
    assert.deepEqual(camp2.keywords, []);
    assert.deepEqual(camp2.unkeywords, []);

    const subLike = {
      title: '紫羅蘭永恆花園',
      keywords: ['動漫國'],
      unkeywords: ['合集'],
    };
    const violet = Subscription.from(subLike);
    assert.equal(violet.title, '紫羅蘭永恆花園');
    assert.deepEqual(violet.keywords, ['動漫國']);
    assert.deepEqual(violet.unkeywords, ['合集']);
  });

  it('Subscription#loadThreads', () => {
    const camp = new Subscription('搖曳露營');
    const threads = [];
    for (let idx = 1; idx < 10; idx++) {
      const rand = new Buffer(new Date().toString())
        .toString('base64')
        .toUpperCase()
        .slice(0, 32);
      threads.push(new Thread({
        title: `【DHR百合組】[搖曳露營△_Yuru Camp][0${idx}][繁體][720P][MP4]`,
        link: `magnet:?xt=urn:btih:${rand}`,
      }));
    }
    camp.loadThreads(threads);
    assert.equal(camp.threads.length, 9);

    threads.push({});
    assert.throws(() => camp.loadThreads(threads), Error);
  });

  it('Subscription#sort', () => {
    const camp = new Subscription('搖曳露營');
    const camp2 = new Subscription('搖曳露營');
    const threads = [];
    for (let idx = 1; idx < 10; idx++) {
      const rand = new Buffer(new Date(idx + new Date()).toString())
        .toString('base64')
        .toUpperCase()
        .slice(0, 32);
      threads.push(new Thread({
        title: `【DHR百合組】[搖曳露營△_Yuru Camp][0${idx}][繁體][720P][MP4]`,
        link: `magnet:?xt=urn:btih:${rand}`,
      }));
    }
    camp.loadThreads(threads);
    threads.unshift(threads.pop()); // last to first
    threads.unshift(threads.pop()); // last to first
    camp2.loadThreads(threads);
    assert.deepEqual(camp.threads, camp2.threads);
  });

  it('Subscription#getThreads', () => {
    const senko = new Subscription(`${__dirname}/../subscribables/senkosan.yml`); // It has episodes from [01]~[12] and [1-12]
    const rand = new Buffer(new Date().toString())
      .toString('base64')
      .toUpperCase()
      .slice(0, 32);
    const threads = [];
    threads.push(new Thread({
      title: `[ZERO字幕组]賢惠幼妻仙狐小姐·Sewayaki Kitsune no Senko-san[1-12][BIG5][1080p]`,
      link: `magnet:?xt=urn:btih:${rand}`,
    }));
    for (let idx = 1; idx < 10; idx++) {
      threads.push(new Thread({
        title: `[ZERO字幕组]賢惠幼妻仙狐小姐·Sewayaki Kitsune no Senko-san[${idx.toString().padStart(2, 0)}][BIG5][1080p]`,
        link: `magnet:?xt=urn:btih:${rand}`,
      }));
    }
    senko.loadThreads(threads);
    const result1 = senko.getThreads('3');
    assert.equal(result1.filter((th) => th.title.includes('[1-12]')).length, 1);
    assert.equal(result1.filter((th) => th.title.includes('[03]')).length, 1);
    const result2 = senko.getThreads('4,5,6');
    assert.equal(result2.filter((th) => th.title.includes('[1-12]')).length, 1);
    assert.equal(result2.filter((th) => th.title.includes('[06]')).length, 1);
  });

  it('Subscription.parseEpisodeStringToEpisodeLike', () => {
    const normals = Subscription.parseEpisodeStringToEpisodeLike('1,5,4');
    const normalAns = [{ ep: 1, type: '' }, { ep: 5, type: '' }, { ep: 4, type: '' }];
    assert.deepEqual(normals.sort(TheEpisode.descendCompare), normalAns.sort(TheEpisode.descendCompare));

    const normalWithOvaSps = Subscription.parseEpisodeStringToEpisodeLike('12,SP2,OVA3');
    const normalWithOvaSpAns = [{ ep: 12, type: '' }, { ep: 2, type: 'SP' }, { ep: 3, type: 'OVA' }];
    assert.deepEqual(normalWithOvaSps.sort(TheEpisode.descendCompare), normalWithOvaSpAns.sort(TheEpisode.descendCompare));

    const complexs = Subscription.parseEpisodeStringToEpisodeLike('1,SP3..1,OVA3,4..5.5,12,7.5');
    const complexAns = [
      { ep: 1, type: 'SP' },
      { ep: 1.5, type: 'SP' },
      { ep: 2.5, type: 'SP' },
      { ep: 3, type: 'SP' },
      { ep: 4.5, type: '' },
      { ep: 5.5, type: '' },
      { ep: 7.5, type: '' },
    ]
      .concat(normalAns)
      .concat(normalWithOvaSpAns);
    assert.deepEqual(complexs.sort(TheEpisode.descendCompare), complexAns.sort(TheEpisode.descendCompare));
  });
});
