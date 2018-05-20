const { Database } = require('arangojs');
const db = new Database({
  url: 'http://db:8529'
});

module.exports = function getDatabase({
  database,
  password = process.env.ARANGO_ROOT_PASSWORD,
  user = 'root'
} = {}) {
  db.useDatabase(database);
  db.useBasicAuth(user, password);
  return db;
}