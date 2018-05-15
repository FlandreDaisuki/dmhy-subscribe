const { print } = require('../..');

module.exports = (thread, config) => {
  print.debug('dmhy:downloaders:stdout:thread', thread);
  print.debug('dmhy:downloaders:stdout:config', config);

  console.log(thread.link);
};
