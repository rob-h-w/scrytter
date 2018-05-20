const db = require('../../getDatabase')();
const { dbName } = require('../../dbName');
const { names } = require('./collection');

module.exports = async function setup() {
  db.useDatabase(dbName);
  await db.get();

  const action = String(function (params) {
    const { db } = require('@arangodb');
    const { metadataName } = params;

    const metadata = db._create(metadataName);

    metadata.save({
      _key: 'version',
      value: 1
    });
  });

  const result = await db.transaction({},
    action,
    {
      metadataName: names.metadata
    }
  );

  return result;
};
