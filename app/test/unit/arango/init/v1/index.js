const { expect } = require('code');
const { beforeEach, describe, it } = exports.lab = require('lab').script();
const proxyquire = require('proxyquire').noCallThru();
const sinon = require('sinon');

const scrytterDbInfo = {
  name: 'scrytter',
  id: '225443',
  path: '/var/lib/arangodb3/databases/database-225443',
  isSystem: false
};

describe('v1', () => {
  let db;
  let metadata;
  let v1;

  beforeEach(() => {
    metadata = {
      create: sinon.stub().resolves()
    };
    db = {
      collection: sinon.stub().withArgs('metadata').returns(metadata),
      createDatabase: sinon.stub(),
      get: sinon.stub().resolves(scrytterDbInfo),
      listCollections: sinon.stub().resolves([ 'metadata' ]),
      listDatabases: sinon.stub().resolves([ '_system', 'scrytter' ]),
      useDatabase: sinon.stub()
    };
    v1 = proxyquire(
      '../../../../../src/arango/init/v1',
      {
        './rollback': sinon.stub(),
        './setup': sinon.stub(),
        './verify': sinon.stub()
      }
    );
  });

  it('exposes an object', () => {
    expect(v1).to.be.an.object();
  });

  describe('object', () => {
    it('has the expected methods', () => {
      const expected = [
        'rollback',
        'setup',
        'verify'
      ];

      expected.forEach((methodName) => {
        const method = v1[methodName];
        expect(method).to.exist();
        expect(method).to.be.a.function();
      });
    });
  });
});
