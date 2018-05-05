const Boom = require('boom');
const Path = require('path');
const {
  getAccessToken,
  getAuthenticationRedirectUri
} = require('./twitter');

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
          console.error(err);
          if (!err.isBoom) {
            if (!(err instanceof Error)) {
              err = new Boom(err.data, { statusCode: err.statusCode });
            } else {
              err = Boom.boomify(err);
            }
          }

          throw err;
        }
      }
    },
    {
      method: 'GET',
      path: '/auth_callback',
      handler: async (request, h) => {
        // TODO: Do something useful with the token & verifier.
        return await getAccessToken(request.query);
      }
    }
  ]
};
