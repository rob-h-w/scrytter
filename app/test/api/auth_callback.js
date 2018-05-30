const { expect } = require('code');
const { afterEach, after, beforeEach, before, describe, it } = exports.lab = require('lab').script();
const mockery = require('mockery');
const nock = require('nock');
const sinon = require('sinon');

const root = 'http://localhost';
const collectionsList = [
  'metadata',
  'quotes',
  'replies',
  'retweets',
  'tweets',
  'users'
];

describe('/auth_callback', () => {
  let application;
  let arangojs;
  let collection;
  let databaseInstance;
  let metadata;
  let rClient;
  let redis;
  let response;
  let rState;
  let server;

  before(() => {
    nock.disableNetConnect();
  });

  after(() => {
    nock.enableNetConnect();
  });

  beforeEach(async () => {
    const rawArango = require('arangojs');
    const rawDb = new rawArango.Database({
      url: 'http://db:8529'
    });
    databaseInstance = sinon.stub(rawDb);
    arangojs = {};
    Object.keys(rawArango).forEach(member => {
      arangojs[member] = sinon.stub(rawArango, member);
    });
    collection = sinon.stub().returns({
      create: sinon.stub().resolves(),
      drop: sinon.stub().resolves(),
      save: sinon.stub().resolves()
    });
    metadata = {
      create: sinon.stub().resolves(),
      document: sinon.stub().resolves({ value: 1 }),
      drop: sinon.stub().resolves(),
      save: sinon.stub().resolves()
    };
    collection.withArgs('metadata').returns(metadata);
    databaseInstance.collection = collection;
    databaseInstance.collections.resolves(collectionsList.map(collection => { return { name: collection }; }));
    databaseInstance.edgeCollection = sinon.stub().returns({
      create: sinon.stub().resolves(),
      drop: sinon.stub().resolves()
    });
    databaseInstance.get.resolves();
    databaseInstance.listDatabases.resolves([ 'scrytter' ]);
    arangojs.Database.returns(databaseInstance);

    rState = {};
    rClient = {
      __proto__: {},
      get: sinon.spy((key, callback) => {
        if (rState[key]) {
          callback(null, rState[key]);
        } else {
          callback(new Error(`${key} not set.`));
        }
      }),
      on: sinon.stub()
    };

    for (let key in rClient) {
      const value = rClient[key];
      rClient.__proto__[key] = value;
    }
    redis = {
      createClient: sinon.stub().resolves(rClient)
    };
    mockery.registerMock('arangojs', arangojs);
    mockery.registerMock('redis', redis);
    mockery.enable();
    application = require('../../src/application');
    server = await application.start();
  });

  afterEach(() => {
    mockery.disable();
  });

  describe('successful path', () => {
    beforeEach(async () => {
      nock(
        'https://api.twitter.com',
        {
          reqheaders: {
            authorization: /OAuth oauth_consumer_key=\"[0-9a-zA-Z]+\",oauth_nonce=\"[0-9a-zA-Z]+\",oauth_signature_method=\"HMAC-SHA1\",oauth_timestamp=\"[0-9]+\",oauth_token=\"token\",oauth_verifier=\"verifier\",oauth_version=\"1.0A\",oauth_signature=\"[0-9a-zA-Z=%]+\"/
          }
        }
      )
        .post('/oauth/access_token')
        .reply(
          200,
          {
            oauth_token: 'access token',
            user_id: 12444,
            screen_name: 'snooples',
            oauth_token_secret: 'shhh'
          }
        );
      rState.token = 'value';
      response = await server.inject({
        method: 'GET',
        url: `${root}/auth_callback?oauth_token=token&oauth_verifier=verifier`
      });
    });

    it('returns 200', () => {
      expect(response.statusCode).to.equal(200);
    });
  });
});
