const { expect } = require('code');
const { beforeEach, describe, it } = exports.lab = require('lab').script();
const proxyquire = require('proxyquire').noCallThru();
const sinon = require('sinon');

const { names } = require('../../../../../src/arango/init/v1/collection');

const scrytterDbInfo = {
  name: 'scrytter',
  id: '225443',
  path: '/var/lib/arangodb3/databases/database-225443',
  isSystem: false
};

describe('v1/rollback', () => {
  let db;
  let collections;
  let rollback;

  beforeEach(() => {
    collections = {};
    Object.values(names).forEach((name) => {
      collections[name] = {
        drop: sinon.stub().resolves()
      };
    });

    function collection(name) {
      return collections[name];
    }

    db = {
      collection: sinon.spy(collection),
      get: sinon.stub().resolves(scrytterDbInfo),
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

    beforeEach(async () => {
      result = await rollback();
    });

    it('uses the right database', () => {
      expect(db.useDatabase.calledWith('scrytter')).to.be.true();
      expect(db.get.called).to.be.true();
    });

    it('drops all v1 collections', () => {
      Object.values(names).forEach((name) => {
        expect(db.collection.calledWith(name)).to.be.true();
        expect(collections[name].drop.calledOnce).to.be.true();
      });
    });
  });
});
