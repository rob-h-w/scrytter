const hapi = require('hapi');
const redis = require('redis');
const { promisify } = require('util');

const { init } = require('./arango');
const logger = require('./logger').get();

const application = {};

const rOptions = {
  db: 0,
  host: 'redis',
  password: process.env.REDIS_ROOT_PASSWORD
};
let rClient = redis.createClient(rOptions);

let initialized = false;

async function initializeApp() {
  if (initialized) {
    return;
  }

  let noArango = true;

  while(noArango) {
    try {
      await init();
      noArango = false;
    } catch (e) {
      logger.warn('failed to get an ArangoDb connection retrying.');
      await new Promise(resolve => {
        setTimeout(resolve, 1000);
      });
    }
  }

  rClient = await rClient;
  application.redis = rClient;

  application.redis.on('error', logger.error);

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
        await initializeApp();

        const { apiRoutes, routes } = require('./routes');

        const server = hapi.server({
            host: '0.0.0.0',
            port: 8925,
            routes
        });

        await server.register(require('inert'));
        await server.register({
          plugin: require('good'),
          opts: {}
        });

        server.route(apiRoutes);

        await server.start();
        logger.info('Server started at: ' + server.info.uri);
        return server;
    }
    catch (err) {
        logger.error(err);
        process.exit(1);
    }
}

module.exports = {
  application,
  initializeApp,
  start
};