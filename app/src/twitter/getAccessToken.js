const { application } = require('../application');
const boom = require('boom');

const oauth = require('./getOauth')();

module.exports = async function getAccessToken({ oauth_token, oauth_verifier}) {
  const oauth_token_secret = await application.redis.getAsync(oauth_token);

  if (!oauth_token_secret) {
    throw boom.preconditionFailed(`Token ${oauth_token} has not been requested from Twitter.`);
  }

  return new Promise((resolve, reject) => {
    oauth.getOAuthAccessToken(
      oauth_token,
      oauth_token_secret,
      oauth_verifier,
      (err, oauth_access_token, oauth_access_token_secret, results) => {
        if (err) {
          return reject(err);
        }

        return resolve({
          oauth_access_token,
          oauth_access_token_secret,
          results
        });
      }
    );
  });
}
