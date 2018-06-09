const Path = require('path');

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
      handler: require('./operations/authenticate')
    },
    {
      method: 'GET',
      path: '/auth_callback',
      handler: require('./operations/authCallback')
    }
  ]
};
