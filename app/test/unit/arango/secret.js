const { expect } = require('code');
const { afterEach, beforeEach, describe, it } = exports.lab = require('lab').script();
const sinon = require('sinon');

const { decrypt, encrypt } = require('../../../src/arango/secret');

const message = 'well hello there';
const staticCypherObject = {
  salt: 'nruo/8iPfua+iD+lF5wYmNXmryVX+dSqrN5d16TtYI34ROVambW/NdGUcfg9WypjfC5oiN9/QHQrU24ekxes7A==',
  cypher: 'Ts+YSNMRLoQDacrnjMp1rafxiWVOXrKZ',
  authTag: '1T5rn33sAA3w7BCSrHTghw==',
  nonce: 'gl5c3UVgMlc0FCQz'
};
const key = 'difficult to guess';

describe('secret', () => {
  let cypherObject;
  let oldKey;
  let plaintext;

  beforeEach(async () => {
    oldKey = process.env.USER_CRYPTO_KEY;
    process.env.USER_CRYPTO_KEY = key;
  });

  afterEach(() => {
    process.env.USER_CRYPTO_KEY = oldKey;
  });

  describe('encrypt', () => {
    it('is a function', () => {
      expect(encrypt).to.be.a.function();
    });

    describe('called', () => {
      beforeEach(() => {
        cypherObject = encrypt(message);
      });

      it('correctly populates the cypher object', () => {
        expect(cypherObject.authTag).to.exist();
        expect(cypherObject.cypher).to.exist();
        expect(cypherObject.nonce).to.exist();
        expect(cypherObject.salt).to.exist();
      });

      it('produces a cypher object that can be decrypted correctly', () => {
        expect(decrypt(cypherObject)).to.equal(message);
      });
    });
  });

  describe('decrypt', () => {
    it('is a function', () => {
      expect(decrypt).to.be.a.function();
    });

    describe('called', () => {
      beforeEach(() => {
        plaintext = decrypt(staticCypherObject);
      });

      it('decrypts the cypher object correctly', () => {
        expect(plaintext).to.equal(message);
      });
    });
  });
});