const assert = require('assert')
const {
  Episode,
  ComplexEpisode,
  ascendEpisodeCompare,
  descendEpisodeCompare
} = require('../../src/dmhy/episode')

describe('dmhy/episode', () => {
  const ep0 = new Episode({ ep: 0 })
  const ep1 = new Episode({ ep: 1 })
  const ep3 = new Episode({ ep: 3 })
  const ep4 = new Episode({ ep: 4 })
  const ep5 = new Episode({ ep: 5 })
  const epsp2 = new Episode({ ep: 2, type: 'SP' })
  const epsp5 = new Episode({ ep: 5, type: 'SP' })
  const epsp11 = new Episode({ ep: 11, type: 'SP' })
  const epova1 = new Episode({ ep: 1, type: 'OVA' })
  const epova2 = new Episode({ ep: 2, type: 'OVA' })
  const epova3 = new Episode({ ep: 3, type: 'OVA' })
  const epova4 = new Episode({ ep: 4, type: 'OVA' })
  const epList = [epsp2, ep0, epova3, ep1, epsp11, ep4, epova4, ep5, epova1, epova2, ep3]
  const ascEpList = [ep0, ep1, ep3, ep4, ep5, epsp2, epsp11, epova1, epova2, epova3, epova4]
  const descEpList = [ep5, ep4, ep3, ep1, ep0, epsp11, epsp2, epova4, epova3, epova2, epova1]
  const xep345 = new ComplexEpisode([ep3, ep4, ep5])
  const xepova4321 = new ComplexEpisode([epova4, epova3, epova2, epova1])
  const xep0sp2 = new ComplexEpisode([ep0, epsp2])
  const xep1sp11 = new ComplexEpisode([ep1, epsp11])
  const ascCepList = [xep0sp2, xep1sp11, xep345, epsp5, xepova4321]
  const descCepList = [xep345, xep1sp11, xep0sp2, epsp5, xepova4321]

  it('Episode ctor', () => {
    assert.equal(ep1.ep, 1)
    assert.equal(ep1.type, '')
    assert.equal(epsp2.ep, 2)
    assert.equal(epsp2.type, 'SP')
    assert.equal(epova3.ep, 3)
    assert.equal(epova3.type, 'OVA')
  })

  it('Episode sorting', () => {
    assert.deepEqual(epList.slice().sort(Episode.ascendCompare), ascEpList)
    assert.deepEqual(epList.slice().sort(Episode.descendCompare), descEpList)
  })

  it('Episode rangify', () => {
    const regular345 = [ep3, ep4, ep5]
    assert.deepEqual(new Set(Episode.rangify([3, 5])), new Set(regular345))

    const ova4321 = [ epova4, epova3, epova2, epova1 ]
    assert.deepEqual(new Set(Episode.rangify([4, 1], 'OVA')), new Set(ova4321))
  })

  it('Episode toString', () => {
    assert.deepEqual(`${epsp2}`, 'SP02')
    assert.deepEqual(`${epsp11}`, 'SP11')
    assert.deepEqual(`${epova2}`, 'OVA02')
    assert.deepEqual(`${ep0}`, '00')
    assert.deepEqual(`${ep1}`, '01')
  })

  it('Episode serialization', () => {
    assert.equal(JSON.stringify(ep1), '{"ep":1,"type":""}')
    assert.equal(JSON.stringify(epsp2), '{"ep":2,"type":"SP"}')
    assert.equal(JSON.stringify(epova3), '{"ep":3,"type":"OVA"}')
    assert.deepEqual(new Episode(JSON.parse(JSON.stringify(ep1))), ep1)
    assert.deepEqual(new Episode(JSON.parse(JSON.stringify(epsp2))), epsp2)
    assert.deepEqual(new Episode(JSON.parse(JSON.stringify(epova3))), epova3)
  })

  it('ComplexEpisode ctor', () => {
    assert.deepEqual(xep345.episodes, [ep5, ep4, ep3])
    assert.deepEqual(xep345.head, ep5)
    assert.deepEqual(xep345.tail, ep3)

    assert.deepEqual(xepova4321.episodes, [epova4, epova3, epova2, epova1])
    assert.deepEqual(xepova4321.head, epova4)
    assert.deepEqual(xepova4321.tail, epova1)

    assert.throws(() => new ComplexEpisode(''), TypeError)
  })

  it('ComplexEpisode toString', () => {
    assert.equal(`${xep345}`, '05, 04, 03')
    assert.equal(`${xepova4321}`, 'OVA04, OVA03, OVA02, OVA01')
  })

  it('ascendEpisodeCompare', () => {
    assert.deepEqual([xep345, xepova4321, epsp5, xep0sp2, xep1sp11].sort(ascendEpisodeCompare), ascCepList)
  })

  it('descendEpisodeCompare', () => {
    assert.deepEqual([xep345, xepova4321, epsp5, xep0sp2, xep1sp11].sort(descendEpisodeCompare), descCepList)
  })
})
