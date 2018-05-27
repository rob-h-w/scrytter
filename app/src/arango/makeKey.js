const { pbkdf2Sync } = require('crypto');

const pepper = Buffer.from('4;lk9=4dfp980 4|-9nf 94fds;ajd;y55|2sbn9]=34501-=iu');
const iterations = 4301;
const keyLen = 32;
const digest = 'sha512';

module.exports = function makeKey(salt) {
  const saltNPepa = Buffer.concat([salt, pepper]);
  return pbkdf2Sync(
    process.env.USER_CRYPTO_KEY,
    saltNPepa,
    iterations,
    keyLen,
    digest
  );
};
