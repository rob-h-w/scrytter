const { OAuth } = require('oauth');

const uri = 'https://api.twitter.com/oauth/request_token';

module.exports = async function getRequestToken({ callbackUri = 'http://localhost:8925/auth_callback' } = {}) {
  const authenticate = '';
  const oauth = new OAuth(
    uri,
    null,
    process.env.TWITTER_KEY,
    process.env.TWITTER_SECRET,
    '1.0A',
    callbackUri,
    'HMAC-SHA1'
  );

  return new Promise((resolve, reject) => {
    try {
      oauth.getOAuthRequestToken(
        (err, oauth_token, oauth_token_secret,  results) => {
          if (err) {
            console.error(err);
            return reject(err);
          }

          return resolve({
            oauth_token,
            oauth_token_secret,
            results
          });
        }
      );
    } catch (e) {
      console.error(err);
      return reject(e);
    }
  });
}