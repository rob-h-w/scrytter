const oauth = require('./getOauth')();

module.exports = async function getRequestToken() {
  return new Promise((resolve, reject) => {
    try {
      oauth.getOAuthRequestToken(
        (err, oauth_token, oauth_token_secret,  results) => {
          if (err) {
            return reject(err);
          }

          return resolve({
            oauth_token,
            oauth_token_secret,
            results
          });
        }
      );
    } catch (err) {
      return reject(err);
    }
  });
}
