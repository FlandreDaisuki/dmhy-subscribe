const { l10n, print, splitKeywords, fetchThreadsByKeywords } = require('../..');
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
  // TODO
  const { keywords, unkeywords } = splitKeywords(argv.ss.split(','));
  const threads = await fetchThreadsByKeywords(keywords, unkeywords);
  threads.forEach((th) => {
    print.log(th.title);
  });
  console.log();
  print.log(l10n('CMD_FIND_TOTAL', { total: threads.length }));
  process.exit(0);
};
