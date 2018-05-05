const { OAuth } = require('oauth');

const accessUrl = 'https://api.twitter.com/oauth/access_token';
const requestUrl = 'https://api.twitter.com/oauth/request_token';
const callbackUrl = 'http://localhost:8925/auth_callback';

const oauth = new OAuth(
  requestUrl,
  accessUrl,
  process.env.TWITTER_KEY,
  process.env.TWITTER_SECRET,
  '1.0A',
  callbackUrl,
  'HMAC-SHA1'
);

module.exports = function getOauth() {
  return oauth;
}