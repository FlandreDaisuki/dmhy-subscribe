// const assert = require('assert')
// const fs = require('fs')
// const { parseEpisodeFromTitle } = require('../crawler')

// describe('Parse episode from title', function () {
//   const lines = fs.readFileSync('test/title.txt', 'utf8').split(/\r?\n/).filter(_ => _)
//   for (let i = 0; i < lines.length;) {
//     if (lines[i].startsWith('❤️')) {
//       i += 1
//       describe(lines[i - 1], function () {
//         for (let j = i; lines[i] && !lines[i].startsWith('❤️'); j += 2, i += 2) {
//           it(lines[j], function () {
//             assert.deepEqual(parseEpisodeFromTitle(lines[j]), JSON.parse(lines[j + 1]))
//           })
//         }
//       })
//     }
//   }
// })

require('./dmhy/episode')
