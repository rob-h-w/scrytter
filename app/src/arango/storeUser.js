const { dbName } = require('./dbName');
const db = require('./getDatabase')({ database: dbName });
const ensureCollection = require('./ensureCollection')(db);
const { encrypt } = require('./secret');
const { names } = require('./v1/collection');

module.exports = async function storeUser(accessKeys) {
  const user = {
    oauth_token: accessKeys.oauth_token,
    user_id: accessKeys.user_id,
    screen_name: accessKeys.screen_name
  };
  user.oauth_token_secret = encrypt(accessKeys.oauth_token_secret);
  const users = await ensureCollection('users');
  await users.save(user);
  return user;
};
