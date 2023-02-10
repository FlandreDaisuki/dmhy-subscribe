import debug from 'debug';
import chalk from 'chalk';
import RSSParser from 'rss-parser';

const d = debug('dmhy:cli:find');

export const command = 'find <title> [keywords..]';

export const describe = 'find specific keywords to describe a subscription';

/** @param {import('yargs').Argv} yargs */
export const builder = (yargs) => {
  yargs
    .option({
      'exclude-title': {
        type: 'boolean',
      },
      'excludes': {
        alias: 'x',
        type: 'array',
        default: [],
      },
    });
};

export const handler = async(argv) => {
  d('argv:', argv);

  const u = new URL('https://share.dmhy.org/topics/rss/rss.xml');
  u.searchParams.append('sort_id', '2');
  u.searchParams.append('keyword', [argv.title].concat(argv.keywords).join(' '));

  d('url:', u.href);

  try {
    const rss = await (new RSSParser).parseURL(u.href)
      .catch((err) => {
        console.error(chalk.blueBright('RSSParser:'), err.message);
      });

    if (!rss) { return process.exit(1); }

    const filteredRssItems = rss.items.filter((item) => {
      return argv.excludes.every((exclude) => {
        return !item.title.includes(exclude);
      });
    });

    for (const item of filteredRssItems) {
      // eslint-disable-next-line no-console
      console.log(item.title);
    }
  } catch (err) {
    console.error(err);
  }
};
