const { expect } = require('code');
const { afterEach, beforeEach, describe, it } = exports.lab = require('lab').script();
const proxyquire = require('proxyquire').noCallThru();
const sinon = require('sinon');

let db;
let ensureCollection;
let ensureCollectionMaker;
let getDatabase;
let storeUser;
let users;

describe('storeUser', () => {
  beforeEach(() => {
    db = {};
    ensureCollection = sinon.stub();
    ensureCollectionMaker = sinon.stub().returns(ensureCollection);
    users = {
      save: sinon.stub().resolves()
    };
    ensureCollection.withArgs('users').resolves(users);
    getDatabase = sinon.stub().returns(db);
    storeUser = proxyquire(
      '../../../src/arango/storeUser',
      {
        './ensureCollection': ensureCollectionMaker,
        './getDatabase': getDatabase
      }
    );
  });

  it('is a function', () => {
    expect(storeUser).to.be.a.function();
  });

  it('gets the database', () => {
    expect(getDatabase.called).to.be.true();
  });

  it('initalizes ensureCollection properly', () => {
    expect(ensureCollectionMaker.calledOnceWithExactly(db)).to.be.true();
  });

  describe('when called', () => {
    const key = 'hard to guess';
    const accessKeys = {
      oauth_token: 'oauth token',
      oauth_token_secret: 'big secret',
      user_id: 'user id',
      screen_name: 'me'
    };

    let user;
    let oldKey;
    beforeEach(async () => {
      oldKey = process.env.USER_CRYPTO_KEY;
      process.env.USER_CRYPTO_KEY = key;
      user = await storeUser(accessKeys);
    });

    afterEach(() => {
      process.env.USER_CRYPTO_KEY = oldKey;
    });

    it('encrypts the token secret', () => {
      expect(user.oauth_token_secret.authTag).to.exist();
      expect(user.oauth_token_secret.cypher).to.exist();
      expect(user.oauth_token_secret.salt).to.exist();
    });
  });
});
