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
      method: 'GET',
      path: '/hello',
      handler: (request, h) => {
        return 'hello world';
      }
    }
  ]
};
