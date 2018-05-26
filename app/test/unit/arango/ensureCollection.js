const { expect } = require('code');
const { beforeEach, describe, it } = exports.lab = require('lab').script();
const proxyquire = require('proxyquire').noCallThru();
const sinon = require('sinon');

const ensureCollectionMaker = require('../../../src/arango/ensureCollection');

const name = 'name';

describe('ensureCollection', () => {
  let collection;
  let db;
  let ensureCollection;

  beforeEach(() => {
    collection = {
      create: sinon.stub().resolves()
    };
    db = {
      collection: sinon.stub().returns(collection)
    };
    ensureCollection = ensureCollectionMaker(db);
  });

  it('is a function', () => {
    expect(ensureCollection).to.be.a.function();
  });

  describe('when called', () => {
    let result;

    describe('when the collection does not exist', () => {
      beforeEach(async () => {
        db.collections = sinon.stub().resolves([]);
        result = await ensureCollection(name);
      });

      it('lists collections & gets the right one', () => {
        expect(db.collections.calledOnce).to.be.true();
        expect(db.collection.calledOnceWithExactly(name)).to.be.true();
      });

      it('creates the collection', () => {
        expect(collection.create.calledOnce).to.be.true();
      });
    });

    describe('when the collection does exist', () => {
      beforeEach(async () => {
        db.collections = sinon.stub().resolves([
          {
            name
          }
        ]);
        result = await ensureCollection(name);
      });

      it('does not create the collection', () => {
        expect(collection.create.called).to.be.false();
      });
    });
  });
});