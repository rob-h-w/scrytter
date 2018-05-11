const Boom = require('boom');
const Path = require('path');

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
          // TODO: Do something useful with the token & verifier.
          return await getAccessToken(request.query);
        } catch (err) {
          handleError(err);
        }
      }
    }
  ]
};
