const getDatabase = require('./getDatabase');

module.exports = async function setAccessKeys() {
  const db = getDatabase({ database: 'accessKeys' });
};
