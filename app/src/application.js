const Hapi = require('hapi');
const redis = require('redis');
const { promisify } = require('util');

const { apiRoutes, routes } = require('./routes');

const application = {};

const rOptions = {
  db: 0,
  host: 'redis',
  password: process.env.REDIS_ROOT_PASSWORD
};
const rClient = redis.createClient(rOptions);

let initialized = false;

async function initializeApp() {
  if (initialized) {
    return;
  }

  await rClient;
  application.redis = rClient;

  application.redis.on('error', console.error);

  Object.entries(rClient.__proto__).forEach(([key, value]) => {
    if (typeof value !== 'function'
      || key[0] === '_') {
      return;
    }

    const asyncKey = `${key}Async`;
    if (application.redis.__proto__[asyncKey] === undefined) {
      application.redis.__proto__[asyncKey] = promisify(rClient.__proto__[key]).bind(rClient);
    }
  });

  initialized = true;
}

async function start() {
    try {
        const server = Hapi.server({
            host: '0.0.0.0',
            port: 8925,
            routes
        });

        await initializeApp();
        await server.register(require('inert'));

        server.route(apiRoutes);

        await server.start();
        console.log('Server started at: ' + server.info.uri);
        return server;
    }
    catch (err) {
        console.error(err);
        process.exit(1);
    }
}

module.exports = {
  application,
  initializeApp,
  start
};