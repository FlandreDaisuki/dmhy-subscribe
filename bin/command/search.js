const { l10n, print, splitKeywords, fetchThreadLikesByKeywords, Thread } = require('../..');

exports.command = 'search <subscribable-string>';

exports.aliases = ['find'];

exports.desc = l10n('CMD_FIND_DESC');

exports.builder = (yargs) => {
  yargs
    .usage(l10n('CMD_FIND_USAGE'))
    .positional('subscribable-string', {
      alias: 'ss',
      type: 'string',
    });
};

exports.handler = async (argv) => {
  const { keywords, unkeywords } = splitKeywords(argv.ss.split(','));
  const threadLikes = await fetchThreadLikesByKeywords(keywords, unkeywords);
  threadLikes.forEach((th) => {
    print.log(th.title);
  });
  console.log();
  print.log(l10n('CMD_FIND_TOTAL', { total: threadLikes.length }));

  // precheck
  threadLikes.forEach((th) => {
    Thread.parseEpisodeFromTitle(th.title);
  });

  process.exit(0);
};
