const { dbName } = require('../dbName');
const db = require('../getDatabase')({ database: dbName });

const metadataName = 'metadata';

module.exports = async function getCurrentVersion() {
  db.useDatabase(dbName);
  await db.get();

  const collections = await db.collections();
  if (!collections.some((collection) => collection.name === metadataName)) {
    return 0;
  }

  const metadata = await db.collection(metadataName);

  try {
    const version = await metadata.document('version');
    return version.value;
  } catch (e) {
    await metadata.drop();
    return 0;
    throw e;
  }
};
