const Boom = require('boom');
const Path = require('path');

const { storeUser } = require('./arango');
const {
  getAccessToken,
  getAuthenticationRedirectUri
} = require('./twitter');
const { handleError } = require('./util');

module.exports = {
  routes: {
    files: {
      relativeTo: Path.join(__dirname, '..', 'public')
    }
  },
  apiRoutes: [
    {
      method: 'GET',
      path: '/',
      handler: {
          file: 'index.html'
      }
    },
    {
      method: 'POST',
      path: '/authenticate',
      handler: async (request, h) => {
        try {
          return await getAuthenticationRedirectUri();
        } catch (err) {
          handleError(err);
        }
      }
    },
    {
      method: 'GET',
      path: '/auth_callback',
      handler: async (request, h) => {
        try {
          const tokenResponse = await getAccessToken(request.query);
          await storeUser(tokenResponse);
          return tokenResponse;
        } catch (err) {
          handleError(err);
        }
      }
    }
  ]
};
