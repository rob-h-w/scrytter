const { expect } = require('code');
const { beforeEach, describe, it } = exports.lab = require('lab').script();
const proxyquire = require('proxyquire').noCallThru();
const sinon = require('sinon');

const ensureEdgeCollectionMaker = require('../../../src/arango/ensureEdgeCollection');

const name = 'name';

describe('ensureEdgeCollection', () => {
  let edgeCollection;
  let db;
  let ensureEdgeCollection;

  beforeEach(() => {
    edgeCollection = {
      create: sinon.stub().resolves()
    };
    db = {
      edgeCollection: sinon.stub().returns(edgeCollection)
    };
    ensureEdgeCollection = ensureEdgeCollectionMaker(db);
  });

  it('is a function', () => {
    expect(ensureEdgeCollection).to.be.a.function();
  });

  describe('when called', () => {
    let result;

    describe('when the collection does not exist', () => {
      beforeEach(async () => {
        db.collections = sinon.stub().resolves([]);
        result = await ensureEdgeCollection(name);
      });

      it('lists collections & gets the right one', () => {
        expect(db.collections.calledOnce).to.be.true();
        expect(db.edgeCollection.calledOnceWithExactly(name)).to.be.true();
      });

      it('creates the collection', () => {
        expect(edgeCollection.create.calledOnce).to.be.true();
      });
    });

    describe('when the collection does exist', () => {
      beforeEach(async () => {
        db.collections = sinon.stub().resolves([
          {
            name
          }
        ]);
        result = await ensureEdgeCollection(name);
      });

      it('does not create the collection', () => {
        expect(edgeCollection.create.called).to.be.false();
      });
    });
  });
});