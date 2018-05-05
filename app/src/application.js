const redis = require('redis');
const { promisify } = require('util');

const application = {
};
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

module.exports = {
  application,
  initializeApp
};