const _ = require('lodash');

const ensureDb = require('./ensureDb');
const getCurrentVersion = require('./getCurrentVersion');

module.exports = function initTo(desiredVersion) {
  return async function init(current) {
    await ensureDb();

    const initialVersion = _.isInteger(current) ? current : await getCurrentVersion();
    let currentVersion = initialVersion;
    const rollback = initTo(currentVersion);

    if (currentVersion === desiredVersion) {
      return;
    }

    const delta = currentVersion < desiredVersion ? 1 : -1;
    const rollingBack = delta === -1;
    const modification = delta === 1 ? 'setup' : 'rollback';

    while(currentVersion !== desiredVersion) {
      const nextVersion = currentVersion + delta;
      const requireVersion = rollingBack ? currentVersion : nextVersion;
      const migration = require(`./v${requireVersion}`);

      try {
        await migration[modification]();
        currentVersion = nextVersion;
        if (!rollingBack) {
          await migration.verify();
        }
      } catch (e) {
        if (!rollingBack) {
          await rollback(currentVersion);
        }

        console.error(`exiting with db at version ${initialVersion}`);
        throw e;
      }
    }
  };
};
