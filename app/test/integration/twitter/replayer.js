const replayer = require('replayer');

[
  'TWITTER_KEY',
  'TWITTER_SECRET',
  'TWITTER_TEST_ACCESS_TOKEN',
  'TWITTER_TEST_ACCESS_TOKEN_SECRET',
  'TWITTER_TEST_USER_ID',
  'TWITTER_TEST_SCREEN_NAME'
].forEach((substitute) => replayer.substitute(substitute, () => process.env[substitute]));

module.exports = replayer;
