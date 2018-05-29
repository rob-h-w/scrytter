const { dbName } = require('../dbName');
const db = require('../getDatabase')({ database: dbName });
const { names } = require('./collection');

module.exports = async function rollback() {
  db.useDatabase(dbName);
  await db.get();
  for (let name in names) {
    const collection = db.collection(name);
    await collection.drop();
  };
};
