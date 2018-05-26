const { expect } = require('code');
const { beforeEach, describe, it } = exports.lab = require('lab').script();
const proxyquire = require('proxyquire').noCallThru();
const sinon = require('sinon');

const { collections, edgeCollections, names } =
  require('../../../../../src/arango/init/v1/collection');

const scrytterDbInfo = {
  name: 'scrytter',
  id: '225443',
  path: '/var/lib/arangodb3/databases/database-225443',
  isSystem: false
};

describe('v1/setup', () => {
  let collection;
  let db;
  let ensureCollection;
  let ensureCollectionMaker;
  let ensureEdgeCollection;
  let ensureEdgeCollectionMaker;
  let metadata;
  let setup;

  beforeEach(() => {
    metadata = {
      create: sinon.stub().resolves(),
      save: sinon.stub().resolves()
    };
    collection = sinon.stub();
    collection.withArgs('metadata').returns(metadata);
    db = {
      collection,
      get: sinon.stub().resolves(scrytterDbInfo),
      useDatabase: sinon.stub()
    };
    ensureCollection = sinon.stub().resolves();
    ensureCollectionMaker = sinon.stub().returns(ensureCollection);
    ensureEdgeCollection = sinon.stub().resolves();
    ensureEdgeCollectionMaker = sinon.stub().returns(ensureEdgeCollection);
    setup = proxyquire(
      '../../../../../src/arango/init/v1/setup',
      {
        '../../ensureCollection': ensureCollectionMaker,
        '../../ensureEdgeCollection': ensureEdgeCollectionMaker,
        '../../getDatabase': sinon.stub().returns(db),
        '../v1': {}
      }
    );
  });

  it('exposes a function', () => {
    expect(setup).to.be.a.function();
  });

  it('initializes collection creators correctly', () => {
    expect(ensureEdgeCollectionMaker.calledOnceWithExactly(db)).to.be.true();
    expect(ensureCollectionMaker.calledOnceWithExactly(db)).to.be.true();
  });

  describe('when called', () => {
    let result;

    beforeEach(async () => {
      result = await setup();
    });

    it('uses the right database', () => {
      expect(db.useDatabase.calledWith('scrytter')).to.be.true();
      expect(db.get.called).to.be.true();
    });

    it('creates the right collections', () => {
      collections.forEach(collection => {
        expect(ensureCollection.calledWith(collection)).to.be.true();
      });
    });

    it('creates the right edge collections', () => {
      edgeCollections.forEach(edgeCollection => {
        expect(ensureEdgeCollection.calledWith(edgeCollection), `expected ${edgeCollection}`).to.be.true();
      });
    });

    it('saves the correct version', () => {
      expect(metadata.save.calledOnceWithExactly({
        _key: 'version',
        value: 1
      })).to.be.true();
    });
  });
});
