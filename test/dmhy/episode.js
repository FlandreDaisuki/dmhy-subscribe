const assert = require('assert');
const {
  TheEpisode,
  Episode,
} = require('../..');

describe('dmhy/episode', () => {
  const ep0 = new TheEpisode({ ep: 0 });
  const ep1 = new TheEpisode({ ep: 1 });
  const ep3 = new TheEpisode({ ep: 3 });
  const ep4 = new TheEpisode({ ep: 4 });
  const ep5 = new TheEpisode({ ep: 5 });
  const epsp2 = new TheEpisode({ ep: 2, type: 'SP' });
  const epsp11 = new TheEpisode({ ep: 11, type: 'SP' });
  const epova1 = new TheEpisode({ ep: 1, type: 'OVA' });
  const epova2 = new TheEpisode({ ep: 2, type: 'OVA' });
  const epova3 = new TheEpisode({ ep: 3, type: 'OVA' });
  const epova4 = new TheEpisode({ ep: 4, type: 'OVA' });
  const epList = [epsp2, ep0, epova3, ep1, epsp11, ep4, epova4, ep5, epova1, epova2, ep3];
  const ascEpList = [ep0, ep1, ep3, ep4, ep5].concat([epsp2, epsp11]).concat([epova1, epova2, epova3, epova4]);
  const descEpList = [ep5, ep4, ep3, ep1, ep0].concat([epsp11, epsp2]).concat([epova4, epova3, epova2, epova1]);
  const xep345 = new Episode([ep3, ep4, ep5]);
  const xepova4321 = new Episode([epova4, epova3, epova2, epova1]);
  const xep0sp2 = new Episode([ep0, epsp2]);
  const xep1sp11 = new Episode([ep1, epsp11]);

  it('TheEpisode ctor', () => {
    assert.equal(ep1.ep, 1);
    assert.equal(ep1.type, '');
    assert.equal(epsp2.ep, 2);
    assert.equal(epsp2.type, 'SP');
    assert.equal(epova3.ep, 3);
    assert.equal(epova3.type, 'OVA');
  });

  it('TheEpisode sorting', () => {
    assert.deepEqual(epList.slice().sort(TheEpisode.ascendCompare), ascEpList);
    assert.deepEqual(epList.slice().sort(TheEpisode.descendCompare), descEpList);
  });

  it('TheEpisode toString', () => {
    assert.deepEqual(`${epsp2}`, 'SP02');
    assert.deepEqual(`${epsp11}`, 'SP11');
    assert.deepEqual(`${epova2}`, 'OVA02');
    assert.deepEqual(`${ep0}`, '00');
    assert.deepEqual(`${ep1}`, '01');
  });

  it('TheEpisode serialization', () => {
    assert.equal(JSON.stringify(ep1), '{"ep":1,"type":""}');
    assert.equal(JSON.stringify(epsp2), '{"ep":2,"type":"SP"}');
    assert.equal(JSON.stringify(epova3), '{"ep":3,"type":"OVA"}');
    assert.deepEqual(new TheEpisode(JSON.parse(JSON.stringify(ep1))), ep1);
    assert.deepEqual(new TheEpisode(JSON.parse(JSON.stringify(epsp2))), epsp2);
    assert.deepEqual(new TheEpisode(JSON.parse(JSON.stringify(epova3))), epova3);
  });

  it('Episode ctor', () => {
    assert.deepEqual(xep345.data, [ep5, ep4, ep3]);
    assert.deepEqual(xepova4321.data, [epova4, epova3, epova2, epova1]);
    assert.deepEqual(xep0sp2.data, [ep0, epsp2]);
    assert.deepEqual(xep1sp11.data, [ep1, epsp11]);
    assert.throws(() => new Episode(''), TypeError);
  });

  it('Episode rangify', () => {
    const normal345 = [ep3, ep4, ep5];
    assert.deepEqual(new Set(Episode.rangify([3, 5])), new Set(normal345));

    const ova4321 = [epova4, epova3, epova2, epova1];
    assert.deepEqual(new Set(Episode.rangify([4, 1], 'OVA')), new Set(ova4321));
  });

  it('Episode toString', () => {
    assert.equal(`${xep345}`, '05, 04, 03');
    assert.equal(`${xepova4321}`, 'OVA04, OVA03, OVA02, OVA01');
  });
});
