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

describe('v1/verify', () => {
  let collections;
  let db;
  let doc;
  let metadata;
  let verify;

  beforeEach(() => {
    collections = sinon.stub().resolves([
      { name: 'metadata' },
      { name: 'quotes' },
      { name: 'replies' },
      { name: 'retweets' },
      { name: 'tweets' },
      { name: 'users' }
    ]);
    doc = {
      value: 1
    };
    metadata = {
      create: sinon.stub().resolves(),
      document: sinon.stub().resolves(doc)
    };
    db = {
      collection: sinon.stub().withArgs('metadata').returns(metadata),
      collections,
      get: sinon.stub().resolves(scrytterDbInfo),
      useDatabase: sinon.stub()
    };
    verify = proxyquire(
      '../../../../src/arango/v1/verify',
      {
        '../getDatabase': sinon.stub().returns(db)
      }
    );
  });

  it('exposes a function', () => {
    expect(verify).to.be.a.function();
  });

  describe('when called', () => {
    let result;

    describe('with the expected state', () => {
      beforeEach(async () => {
        result = await verify();
      });

      it('uses the right database', () => {
        expect(db.useDatabase.calledWith('scrytter')).to.be.true();
        expect(db.get.called).to.be.true();
      });

      it('uses metadata', () => {
        expect(db.collection.calledWithExactly('metadata')).to.be.true();
      });
    });

    describe('with an unexpected version', () => {
      let error;

      beforeEach(async () => {
        error = undefined;
        doc.value = 2;
        try {
          result = await verify();
        } catch (e) {
          error = e;
        }
      });

      it('uses metadata', () => {
        expect(db.collection.calledWithExactly('metadata')).to.be.true();
      });

      it('throws', () => {
        expect(error).to.exist();
      })
    });

    describe('with an unexpected collection set', () => {
      let error;

      beforeEach(async () => {
        error = undefined;
        collections.resolves([
          { name: 'metadata' },
          { name: 'replies' },
          { name: 'retweets' },
          { name: 'tweets' },
          { name: 'users' }
        ]);
        try {
          result = await verify();
        } catch (e) {
          error = e;
        }
      });

      it('throws', () => {
        expect(error).to.exist();
      })
    });
  });
});
