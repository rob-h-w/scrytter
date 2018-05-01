const getRequestToken = require('./getRequestToken');

function getCallbackUri() {
  return 'http://localhost:8925/auth_callback';
}

function constructRedirect({ token }) {
  return `https://api.twitter.com/oauth/authenticate?oauth_token=${token}`;
}

module.exports = async function getAuthenticationRedirectUri() {
  const rToken = await getRequestToken({ uri: getCallbackUri() });
  return { redirect: constructRedirect({ token: rToken.oauth_token }) };
}
