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

describe('v1/rollback', () => {
  let db;
  let metadata;
  let rollback;

  beforeEach(() => {
    metadata = {
      create: sinon.stub().resolves(),
      drop: sinon.stub().resolves()
    };
    db = {
      collection: sinon.stub().withArgs('metadata').returns(metadata),
      collections: sinon.stub().resolves([]),
      createDatabase: sinon.stub(),
      get: sinon.stub().resolves(scrytterDbInfo),
      listCollections: sinon.stub().resolves([ 'metadata' ]),
      listDatabases: sinon.stub().resolves([ '_system', 'scrytter' ]),
      useDatabase: sinon.stub()
    };
    rollback = proxyquire(
      '../../../../../src/arango/init/v1/rollback',
      {
        '../../getDatabase': sinon.stub().returns(db)
      }
    );
  });

  it('exposes a function', () => {
    expect(rollback).to.be.a.function();
  });

  describe('when called', () => {
    let result;

    describe('with no prior collections', () => {
      beforeEach(async () => {
        db.collections = sinon.stub().resolves([]);
        result = await rollback();
      });

      it('uses the right database', () => {
        expect(db.useDatabase.calledWith('scrytter')).to.be.true();
        expect(db.get.called).to.be.true();
      });

      it('does not drop metadata', () => {
        expect(metadata.drop.called).to.be.false();
      });
    });

    describe('prior collections', () => {
      beforeEach(async () => {
        db.collections = sinon.stub().resolves([
          {
            name: 'metadata'
          },
          {
            name: 'ignore this'
          }
        ]);
        result = await rollback();
      });

      it('drops only metadata', () => {
        expect(db.collection.calledOnceWithExactly('metadata')).to.be.true();
        expect(metadata.drop.calledOnce).to.be.true();
      });
    });
  });
});
