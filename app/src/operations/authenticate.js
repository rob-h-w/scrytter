const { getAuthenticationRedirectUri } = require('../twitter');
const { handleError } = require('../util');

module.exports = async (request, h) => {
  try {
    return await getAuthenticationRedirectUri();
  } catch (err) {
    handleError(err);
  }
};
