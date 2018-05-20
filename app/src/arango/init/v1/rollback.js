const db = require('../../getDatabase')();
const { dbName } = require('../../dbName');
const { names } = require('./collection');

module.exports = async function rollback() {
  db.useDatabase(dbName);
  await db.get();

  const collections = await db.collections();
  if (collections.some((collection) => collection.name === names.metadata)) {
    const metadata = db.collection(names.metadata);
    await metadata.drop();
  }
};
