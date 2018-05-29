const { dbName } = require('../dbName');
const db = require('../getDatabase')({ database: dbName });

module.exports = async function ensureDb() {
  db.useDatabase('_system');
  await db.get();
  const dbs = await db.listDatabases();

  if (dbs.indexOf(dbName) === -1) {
    await db.createDatabase(dbName);
  }
};
