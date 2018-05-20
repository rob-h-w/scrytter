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

describe('v1/setup', () => {
  let db;
  let setup;

  beforeEach(() => {
    db = {
      get: sinon.stub().resolves(scrytterDbInfo),
      transaction: sinon.stub().resolves({}),
      useDatabase: sinon.stub()
    };
    setup = proxyquire(
      '../../../../../src/arango/init/v1/setup',
      {
        '../../getDatabase': sinon.stub().returns(db),
        '../v1': {}
      }
    );
  });

  it('exposes a function', () => {
    expect(setup).to.be.a.function();
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

    it('calls transaction correctly', () => {
      expect(db.transaction.calledOnce).to.be.true();
      expect(db.transaction.args[0][2]).to.equal({
        metadataName: 'metadata'
      });
    });
  });
});
