const { createCipheriv, createDecipheriv, randomBytes } = require('crypto');

const makeKey = require('./makeKey');

const algo = 'aes-256-gcm';
const bonceLength = 8;

function encrypt(plaintext) {
  const cypherObject = {};
  const salt = randomBytes(64);
  const key = makeKey(salt);
  const nonce = randomBytes(12);
  const bonce = randomBytes(bonceLength).toString('base64').substr(0, bonceLength);

  const cypher = createCipheriv(algo, key, nonce);

  cypherObject.salt = salt.toString('base64');
  cypherObject.cypher = cypher.update(`${bonce}${plaintext}`, 'utf8').toString('base64');
  cypher.final();
  cypherObject.authTag = cypher.getAuthTag().toString('base64');
  cypherObject.nonce = nonce.toString('base64');

  return cypherObject;
};

function decrypt(cypherObject) {
  const key = makeKey(Buffer.from(cypherObject.salt, 'base64'));
  const decypher = createDecipheriv(algo, key, Buffer.from(cypherObject.nonce, 'base64'));
  decypher.setAuthTag(Buffer.from(cypherObject.authTag, 'base64'));
  let decrypted = decypher.update(cypherObject.cypher, 'base64', 'utf8');
  decrypted += decypher.final('utf8');
  return decrypted.substr(bonceLength);
}

module.exports = {
  decrypt,
  encrypt
};
