import { describe, expect, test } from 'vitest';
import { compileEpisodeQuery, joinToRegExp, parseEpisode, parsePattern } from '../src/utils.mjs';

test('parsePattern', () => {
  expect(parsePattern('//').test('abc123')).toBe(true);
  expect(parsePattern('/\\d/').test('abc')).toBe(false);
  expect(parsePattern('/\\d/').test('abc123')).toBe(true);
  expect(parsePattern('/(\\d)/').test('abc123')).toBe(true);
  expect(parsePattern('/(\\w+)\\d+/').test('abc123')).toBe(true);
  expect(parsePattern('/ABC123/').test('abc123')).toBe(false);
  expect(parsePattern('/ABC123/i').test('abc123')).toBe(true);
  expect(parsePattern('/^hello\\s*,?\\s*world$/ig').test('Hello,world')).toBe(true);
  expect(parsePattern('/^(?:the|hello)\\s*,?\\s*world$/ig').test('the world')).toBe(true);

  expect(() => parsePattern('^(?:the|hello)\\s*,?\\s*world$').test('the world'))
    .throw('Input string must be in the format "/pattern/flags"');
});

test('joinToRegExp', () => {
  const words = ['hello', 'w?o?r?l?d?', '$5.99', '^99% discount$', 'tic|toc'];
  expect(joinToRegExp(words).test('hello')).toBe(true);
  expect(joinToRegExp(words).test('')).toBe(false);
  expect(joinToRegExp(words).test('world')).toBe(false);
  expect(joinToRegExp(words).test('w?o?r?l?d?')).toBe(true);
  expect(joinToRegExp(words).test('5.99')).toBe(false);
  expect(joinToRegExp(words).test('$5.99')).toBe(true);
  expect(joinToRegExp(words).test('99% discount')).toBe(false);
  expect(joinToRegExp(words).test('^99% discount$')).toBe(true);
  expect(joinToRegExp(words).test('tic')).toBe(false);
  expect(joinToRegExp(words).test('tic|toc')).toBe(true);
});

describe('parseEpisode', () => {
  // cSpell:disable
  test('one episode', () => {
    expect(parseEpisode('[澄空学园] 紫罗兰永恒花园 第08话 MP4 720p v2')).toMatchObject({ from: 8 });
    expect(parseEpisode('【DHR百合組】[搖曳露營△_Yuru Camp][08][繁體][720P][MP4]')).toMatchObject({ from: 8 });
    expect(parseEpisode('【西农YUI汉化组】★十月新番【三月的狮子 3-gatsu no Lion 2】第16话 GB简体 720P MP4')).toMatchObject({ from: 16 });
    expect(parseEpisode('【喵萌奶茶屋&千夏字幕組】【輕旅輕營_Yuru Camp】[第08話][1280x720][MP4][繁體]（諢名：搖曳露營）')).toMatchObject({ from: 8 });
    expect(parseEpisode('[INDRA&NMKST][四月新番] 櫻花任務 / Sakura Quest [16] [720P][HardSub][BIG5][x264 AAC][v3]')).toMatchObject({ from: 16 });
    expect(parseEpisode('【追新番字幕组】【3月的狮子】【Sangatsu no Lion】【第16集】【中日双语字幕】【HDTVrip】【1280X720】【mp4】')).toMatchObject({ from: 16 });
    expect(parseEpisode('【喵萌茶会字幕组】★4月新番【Saenai Heroine no Sodatekata ♭ / 路人女主的养成方法♭】[08v3][1080P][MP4][简体]')).toMatchObject({ from: 8 });
    expect(parseEpisode('[SweetSub&圓環記錄攻略組][魔法紀錄 魔法少女小圓外傳][Magia Record][08][WebRip][1080P][AVC 8bit][繁體內嵌][v2]')).toMatchObject({ from: 8 });
    expect(parseEpisode('【極影字幕社】 ★一月新番【魔卡少女櫻 透明卡牌篇】【Cardcaptor Sakura Clear Card Hen】【08】【BIG5】【1080P】（字幕社招內詳）')).toMatchObject({ from: 8 });
  });

  test('range episode', () => {
    expect(parseEpisode('【DHR百合組】[搖曳露營△_Yuru Camp][05-06][繁體][720P][MP4]')).toMatchObject({ from: 5, to: 6 });
    expect(parseEpisode('【幻櫻字幕組】【4月新番】【戰鬥員派遣中！ Sentouin, Hakenshimasu!】【01~02】【BIG5_MP4】【1920X1080】')).toMatchObject({ from: 1, to: 2 });
    expect(parseEpisode('[愛戀字幕社&漫貓字幕社] 鬼灭之刃 刀匠村篇/Kimetsu no Yaiba - Katanakaji no Sato-hen (01-11Fin WEBRIP 1080p AVC AAC MP4 2023年4月 繁中)')).toMatchObject({ from: 1, to: 11 });
  });

  test('no brackets', () => {
    expect(parseEpisode('【極影字幕社】★ 粗點心戰爭2 第05集 BIG5 AVC 720p MP4')).toMatchObject({ from: 5 });
    expect(parseEpisode('[喵萌奶茶屋&千夏字幕组&LoliHouse] 轻旅轻营/摇曳露营/Yuru Camp - 08 [WebRip 1920x1080 HEVC-10bit AAC][简繁外挂字幕]')).toMatchObject({ from: 8 });
  });

  test('has encoding parameters', () => {
    expect(parseEpisode('【DMHY】【黑色五葉草/Black_Clover】[16][1080P][x264_AAC_10bit][繁體]')).toMatchObject({ from: 16 });
    expect(parseEpisode('[漫游字幕组] 网络胜利组 Netojuu no Susume 11FIN 简体/繁体外挂 1080P HEVC 10bit MKV')).toMatchObject({ from: 11 });
  });

  test('sp, ova, clip show', () => {
    expect(parseEpisode('【DHR百合組】[Princess Principal][SP03][繁體][BDRip][720P][MP4]')).toMatchObject({ from: 3 });
    expect(parseEpisode('【動漫國字幕組】★01月新番[OVERLORD 第二季][03+SP03][1080P][HEVC_Ma10P][簡繁外掛][MKV]')).toMatchObject({ from: 3 });
    expect(parseEpisode('【7月/悠哈璃羽字幕社】[UHA-WINGS][狂赌之渊][Kakegurui][5.5v2][评论音轨][720p][BIG5]')).toMatchObject({ from: 5.5 });
  });

  test('not support', () => {
    expect(parseEpisode('[c.c動漫][8月][Fate Grand Order - 絕對魔獸戰線巴比倫尼亞][特別篇][BIG5][1080P][網盤]')).toMatchObject({});
  });
  // cSpell:enable
});

describe('compileEpisodeQuery', () => {
  test('single query in same type', () => {
    expect(compileEpisodeQuery('1').match({ episode: parseEpisode('1'), order: 99 })).toBe(true);
    expect(compileEpisodeQuery('1').match({ episode: parseEpisode('3'), order: 99 })).toBe(false);
    expect(compileEpisodeQuery('2~4').match({ episode: parseEpisode('1'), order: 99 })).toBe(false);
    expect(compileEpisodeQuery('2~4').match({ episode: parseEpisode('3'), order: 99 })).toBe(true);
    expect(compileEpisodeQuery('@1').match({ episode: parseEpisode('99'), order: 1 })).toBe(true);
    expect(compileEpisodeQuery('@1').match({ episode: parseEpisode('99'), order: 3 })).toBe(false);
    expect(compileEpisodeQuery('@2~4').match({ episode: parseEpisode('99'), order: 1 })).toBe(false);
    expect(compileEpisodeQuery('@2~4').match({ episode: parseEpisode('99'), order: 3 })).toBe(true);
  });

  test('multiple query in same type', () => {
    expect(compileEpisodeQuery('1', '3').match({ episode: parseEpisode('1'), order: 99 })).toBe(true);
    expect(compileEpisodeQuery('1', '4~6').match({ episode: parseEpisode('3'), order: 99 })).toBe(false);
    expect(compileEpisodeQuery('1~4', '6~9').match({ episode: parseEpisode('5'), order: 99 })).toBe(false);
    expect(compileEpisodeQuery('1, 3').match({ episode: parseEpisode('1'), order: 99 })).toBe(true);
    expect(compileEpisodeQuery('1, 6~9').match({ episode: parseEpisode('3'), order: 99 })).toBe(false);
    expect(compileEpisodeQuery('1~4, 6~9').match({ episode: parseEpisode('5'), order: 99 })).toBe(false);
  });

  test('mixed query', () => {
    expect(compileEpisodeQuery('4', '@3').match({ episode: parseEpisode('4'), order: 6 })).toBe(true);
    expect(compileEpisodeQuery('1', '@6').match({ episode: parseEpisode('4'), order: 6 })).toBe(true);
    expect(compileEpisodeQuery('1~4', '@3').match({ episode: parseEpisode('4'), order: 6 })).toBe(true);
    expect(compileEpisodeQuery('1', '@3~6').match({ episode: parseEpisode('4'), order: 6 })).toBe(true);
    expect(compileEpisodeQuery('1~3', '@3~5').match({ episode: parseEpisode('4'), order: 6 })).toBe(false);
  });

  test('all pass query', () => {
    expect(compileEpisodeQuery().match({ episode: parseEpisode('4'), order: 6 })).toBe(true);
    expect(compileEpisodeQuery().match({ episode: parseEpisode('1'), order: 99 })).toBe(true);
    expect(compileEpisodeQuery().match({ episode: parseEpisode('99'), order: 3 })).toBe(true);
    expect(compileEpisodeQuery().match({ episode: parseEpisode('99'), order: 3.5 })).toBe(true);
    expect(compileEpisodeQuery().match({ episode: parseEpisode('3.14'), order: 3.5 })).toBe(true);
  });

  test('half range query', () => {
    // match 2, 3, 4
    expect(compileEpisodeQuery('2~4').match({ episode: parseEpisode('3'), order: 99 })).toBe(true);
    expect(compileEpisodeQuery('2~4').match({ episode: parseEpisode('3.5'), order: 99 })).toBe(false);

    // match 2.5, 3.5
    expect(compileEpisodeQuery('2.5~4').match({ episode: parseEpisode('3.5'), order: 99 })).toBe(true);
    expect(compileEpisodeQuery('2.5~4').match({ episode: parseEpisode('4'), order: 99 })).toBe(false);

    // match 2, 3, 4
    expect(compileEpisodeQuery('2~4.5').match({ episode: parseEpisode('3.5'), order: 99 })).toBe(false);
    expect(compileEpisodeQuery('2~4.5').match({ episode: parseEpisode('4'), order: 99 })).toBe(true);

    // match 2.5, 3.5, 4.5
    expect(compileEpisodeQuery('2.5~4.5').match({ episode: parseEpisode('4'), order: 99 })).toBe(false);
    expect(compileEpisodeQuery('2.5~4.5').match({ episode: parseEpisode('4.5'), order: 99 })).toBe(true);
  });

  test('query overlapping', () => {
    expect(compileEpisodeQuery('2').match({ episode: parseEpisode('3~5'), order: 99 })).toBe(false);
    expect(compileEpisodeQuery('2~4').match({ episode: parseEpisode('3~5'), order: 99 })).toBe(true);
    expect(compileEpisodeQuery('2~6').match({ episode: parseEpisode('3~5'), order: 99 })).toBe(true);
  });
});
