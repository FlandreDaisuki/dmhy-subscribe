const Table = require('easy-table');
const { l10n, print, Config } = require('../..');

exports.command = 'config [key] [value]';

exports.aliases = ['cfg'];

exports.desc = l10n('CMD_CFG_DESC');

exports.builder = (yargs) => {
  yargs
    .usage(l10n('CMD_CFG_USAGE'))
    .option('reset', {
      describe: l10n('CMD_CFG_OPT_RESET'),
      type: 'boolean',
    })
    .example('$0 config', l10n('CMD_CFG_EXAMPLE1_DESC'))
    .example('$0 config downloader', l10n('CMD_CFG_EXAMPLE2_DESC'))
    .example('$0 config downloader deluge', l10n('CMD_CFG_EXAMPLE3_DESC'));
};

exports.handler = (argv) => {
  // pkv := parameter key value
  const config = new Config();
  if (argv.key) {
    let pkv = config.get(argv.key);
    if (!pkv) {
      print.error(l10n('CMD_CFG_UNKNOWN_KEY', { key: argv.key }));
      process.exit(1);
    }
    if (argv.value) {
      const validator = Config.VALIDATORS[pkv.key] || (() => ({ 'ok': true }));
      const result = validator(argv.value);
      if (!result.ok) {
        print.warn(result.msg);
      }
      const spkv = config.set(argv.key, argv.value);
      if (spkv) {
        print.success(l10n('CMD_CFG_SET_SUCCESS'));
      } else {
        print.error(l10n('CMD_CFG_SET_FAILED'));
      }

      const printable = {};
      printable[l10n('CMD_CFG_CELL_KEY')] = spkv.key;
      printable[l10n('CMD_CFG_CELL_VALUE')] = spkv.value;
      console.log(Table.print(printable));
    } else {
      if (argv.reset) {
        config.reset(argv.key);
        pkv = config.get(argv.key);
      }
      const printable = {};
      printable[l10n('CMD_CFG_CELL_KEY')] = pkv.key;
      printable[l10n('CMD_CFG_CELL_VALUE')] = pkv.value;
      console.log(Table.print(printable));
    }
  } else {
    if (argv.reset) {
      config.reset();
    }
    const t = new Table();
    Object.entries(config.parameters).forEach(([key, value]) => {
      t.cell(l10n('CMD_CFG_CELL_KEY'), key);
      t.cell(l10n('CMD_CFG_CELL_VALUE'), value);
      t.newRow();
    });
    console.log(t.toString());
  }
  process.exit(0);
};
