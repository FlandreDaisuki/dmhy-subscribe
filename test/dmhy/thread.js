const fs = require('fs');
const assert = require('assert');
const { Thread } = require('../..');

describe('dmhy/thread', () => {
  it('Thread ctor', () => {
    const threadLike = {
      title: '【DHR百合組】[搖曳露營△_Yuru Camp][08][繁體][720P][MP4]',
      link: 'magnet:?xt=urn:btih:ADPQFKBWXUUFLJMRYWVBGVWBE3GSJSSG',
    };

    assert.doesNotThrow(() => new Thread(threadLike));
    assert.doesNotThrow(() => new Thread(threadLike, /\[(\d+)\]/));
    assert.throws(() => new Thread({}), Error);
  });

  it('Thread serialization', () => {
    const th0 = new Thread({
      title: '【DHR百合組】[搖曳露營△_Yuru Camp][08][繁體][720P][MP4]',
      link: 'magnet:?xt=urn:btih:ADPQFKBWXUUFLJMRYWVBGVWBE3GSJSSG',
    });
    assert.deepEqual(new Thread(JSON.parse(JSON.stringify(th0))), th0);
  });

  describe('Thread.parseEpisodeFromTitle', () => {
    const lines = fs.readFileSync('test/title.txt', 'utf8').split(/\r?\n/).filter((_) => _);
    for (let i = 0; i < lines.length;) {
      if (lines[i].startsWith('❤️')) {
        i += 1;
        describe(lines[i - 1].slice(1), function() {
          for (let j = i; lines[i] && !lines[i].startsWith('❤️'); j += 2, i += 2) {
            it(lines[j], function() {
              const parsed = Thread.parseEpisodeFromTitle(lines[j]).data;
              const except = JSON.parse(lines[j + 1]);
              assert.deepEqual(parsed, except);
            });
          }
        });
      }
    }
  });
});
