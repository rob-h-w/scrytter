const { expect } = require('code');
const { beforeEach, describe, it } = exports.lab = require('lab').script();
const proxyquire = require('proxyquire').noCallThru();
const sinon = require('sinon');

const root = 'http://localhost';

describe('/auth_callback', () => {
  let application;
  let arangojs;
  let collection;
  let databaseInstance;
  let metadata;
  let rClient;
  let redis;
  let response;
  let server;

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
      drop: sinon.stub().resolves()
    });
    metadata = {
      create: sinon.stub().resolves(),
      document: sinon.stub().resolves({ value: 1 }),
      drop: sinon.stub().resolves(),
      save: sinon.stub().resolves()
    };
    collection.withArgs('metadata').returns(metadata);
    databaseInstance.collection = collection;
    databaseInstance.collections.resolves([]);
    databaseInstance.edgeCollection = sinon.stub().returns({
      create: sinon.stub().resolves(),
      drop: sinon.stub().resolves()
    });
    databaseInstance.get.resolves();
    databaseInstance.listDatabases.resolves([]);
    arangojs.Database.returns(databaseInstance);

    rClient = {};
    redis = {
      createClient: sinon.stub().returns(rClient)
    };
    application = proxyquire('../../src/application', {
      'arangojs': arangojs,
      'redis': redis
    });
    server = await application.start();
  });

  describe('successful path', () => {
    beforeEach(async () => {
      response = await server.inject({
        method: 'GET',
        url: `${root}/auth_callback`
      });
    });

    it('returns 200', () => {
      expect(response.code).to.equal(200);
    });
  });
});
