const _ = require('lodash');

const { application } = require('../application');
const getRequestToken = require('./getRequestToken');

const expiry = 5 * 60;

function constructRedirect({ token }) {
  return `https://api.twitter.com/oauth/authenticate?oauth_token=${encodeURIComponent(token)}`;
}

module.exports = async function getAuthenticationRedirectUri() {
  const rToken = await getRequestToken();

  const token = _.get(rToken, 'oauth_token', null);
  const secret = _.get(rToken, 'oauth_token_secret', null);

  if (!token) {
    throw new Error('No request token returned');
  }

  if (!secret) {
    throw new Error('No token secret returned');
  }

  application.redis.set(token, secret, 'EX', expiry);
  return { redirect: constructRedirect({ token: rToken.oauth_token }) };
}
