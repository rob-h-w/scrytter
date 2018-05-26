const db = require('../../getDatabase')();
const ensureCollection = require('../../ensureCollection')(db);
const ensureEdgeCollection = require('../../ensureEdgeCollection')(db);
const { dbName } = require('../../dbName');
const { collections, edgeCollections, names } = require('./collection');

module.exports = async function setup() {
  db.useDatabase(dbName);
  await db.get();

  for(let i = 0; i < collections.length; i++) {
    await ensureCollection(collections[i]);
  }

  for(let i = 0; i < edgeCollections.length; i++) {
    await ensureEdgeCollection(edgeCollections[i]);
  }

  const metadata = db.collection(names.metadata);
  await metadata.save({
    _key: 'version',
    value: 1
  });
};
