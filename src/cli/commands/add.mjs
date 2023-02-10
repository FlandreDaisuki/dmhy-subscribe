import debug from 'debug';

const d = debug('dmhy:cli:add');

export const command = 'add <title> [keywords..]';

export const describe = 'add specific keywords to describe a subscription';

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
      },
    });
};

export const handler = (argv) => {
  d(argv);
  // TODO
};
