const _ = require('lodash');

const ensureDb = require('./ensureDb');
const getCurrentVersion = require('./getCurrentVersion');

module.exports = function initTo(desiredVersion) {
  return async function init(current) {
    const currentVersionSpecifiedExternally = _.isInteger(current);
    await ensureDb();

    let currentVersion = currentVersionSpecifiedExternally ? current : await getCurrentVersion();
    const rollback = initTo(currentVersion);

    if (currentVersion === desiredVersion) {
      return;
    }

    const delta = currentVersion < desiredVersion ? 1 : -1;
    const forwards = delta === 1 ? 'setup' : 'rollback';

    while(currentVersion !== desiredVersion) {
      const nextVersion = currentVersion + delta;
      const requireVersion = delta === 1 ? nextVersion : currentVersion;
      const migration = require(`./v${requireVersion}`);

      try {
        await migration[forwards]();
        currentVersion = nextVersion;
        if (delta > 0) {
          await migration.verify();
        }
      } catch (e) {
        console.error(e);

        if (!currentVersionSpecifiedExternally) {
          await rollback(currentVersion);
        }

        console.error(`exiting with db at version ${currentVersion}`);
        throw e;
      }
    }
  };
};
