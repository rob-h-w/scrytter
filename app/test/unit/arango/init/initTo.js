const bunyan = require('bunyan');
const { expect } = require('code');
const { afterEach, beforeEach, describe, it } = exports.lab = require('lab').script();
const proxyquire = require('proxyquire').noCallThru();
const sinon = require('sinon');

const logTemplate = bunyan.createLogger({
  name: 'test'
});

describe('arango/initTo', () => {
  let bunyanMock;
  let ensureDb;
  let getCurrentVersion;
  let init;
  let initTo;
  let migration1;
  let migration2;

  beforeEach(() => {
    bunyanMock = sinon.mock(logTemplate);

    ensureDb = sinon.stub().resolves();
    getCurrentVersion = sinon.stub();
    migration1 = {
      rollback: sinon.stub().resolves(),
      setup: sinon.stub().resolves(),
      verify: sinon.stub().resolves()
    };
    migration2 = {
      rollback: sinon.stub().resolves(),
      setup: sinon.stub().resolves(),
      verify: sinon.stub().resolves()
    };
    initTo = proxyquire(
      '../../../../src/arango/init/initTo',
      {
        './ensureDb': ensureDb,
        './getCurrentVersion': getCurrentVersion,
        '../../logger': { get: () => logTemplate },
        '../v1': {}
      });
  });

  afterEach(() => {
    bunyanMock.verify();
    bunyanMock.restore();
  });

  it('exists', () => {
    expect(initTo).to.exist();
  });

  it('is a function', () => {
    expect(initTo).to.be.a.function();
  });

  describe('init to 1 from 0', () => {
    beforeEach(() => {
      getCurrentVersion.resolves(0);
      initTo = proxyquire(
        '../../../../src/arango/init/initTo',
        {
          './ensureDb': ensureDb,
          './getCurrentVersion': getCurrentVersion,
          '../../logger': { get: () => logTemplate },
          '../v1': migration1
        });
      init = initTo(1);
    });

    it('exists', () => {
      expect(init).to.exist();
    });

    it('is a function', () => {
      expect(init).to.be.a.function();
    });

    describe('successful', () => {
      beforeEach(async () => {
        result = await init();
      });

      it('calls ensureDb', () => {
        expect(ensureDb.called).to.be.true();
      });

      it('calls migration.setup', () => {
        expect(migration1.setup.called).to.be.true();
      });

      it('calls migration.verify', () => {
        expect(migration1.verify.called).to.be.true();
      });

      it('does not call rollback', () => {
        expect(migration1.rollback.called).to.be.false();
      });
    });

    describe('setup rejects', () => {
      let error;

      beforeEach(async () => {
        migration1.setup.rejects(new Error());

        bunyanMock.expects('error');

        try {
          await init();
        } catch (e) {
          error = e;
        }
      });

      it('throws', () => {
        expect(error).to.exist();
        expect(error).to.be.an.instanceOf(Error);
      })

      it('does not call verify', () => {
        expect(migration1.verify.called).to.be.false();
      });

      it('does not call rollback', () => {
        expect(migration1.rollback.called).to.be.false();
      });
    });

    describe('verify rejects', () => {
      let error;

      beforeEach(async () => {
        migration1.verify.rejects(new Error());

        bunyanMock.expects('error');

        try {
          await init();
        } catch (e) {
          error = e;
        }
      });

      it('calls rollback', () => {
        expect(migration1.rollback.called).to.be.true();
      });
    });
  });

  describe('init to 2 from 0', () => {
    beforeEach(() => {
      getCurrentVersion.resolves(0);
      initTo = proxyquire(
        '../../../../src/arango/init/initTo',
        {
          './ensureDb': ensureDb,
          './getCurrentVersion': getCurrentVersion,
          '../../logger': { get: () => logTemplate },
          '../v1': migration1,
          '../v2': migration2
        });
      init = initTo(2);
    });

    describe('successful', () => {
      beforeEach(async () => {
        result = await init();
      });

      it('calls ensureDb', () => {
        expect(ensureDb.called).to.be.true();
      });

      it('calls migration.setup', () => {
        expect(migration1.setup.called).to.be.true();
        expect(migration2.setup.called).to.be.true();
      });

      it('calls migration.verify', () => {
        expect(migration1.verify.called).to.be.true();
        expect(migration2.verify.called).to.be.true();
      });

      it('does not call rollback', () => {
        expect(migration1.rollback.called).to.be.false();
        expect(migration2.rollback.called).to.be.false();
      });
    });

    describe('v2 setup fails', () => {
      let error;

      beforeEach(async () => {
        migration2.setup.rejects(new Error());

        bunyanMock.expects('error');

        try {
          result = await init();
        } catch (e) {
          error = e;
        }
      });

      it('calls each setup a maximum of once', () => {
        expect(migration1.setup.calledOnce).to.be.true();
        expect(migration2.setup.calledOnce).to.be.true();
      });

      it('calls migration.setup', () => {
        expect(migration1.setup.called).to.be.true();
        expect(migration2.setup.called).to.be.true();
      });

      it('calls migration.verify on migration 1 only', () => {
        expect(migration1.verify.called).to.be.true();
        expect(migration2.verify.called).to.be.false();
      });

      it('does call rollback only for migration 1', () => {
        expect(migration1.rollback.called).to.be.true();
        expect(migration2.rollback.called).to.be.false();
      });
    });

    describe('v2 verify fails and rollback fails', () => {
      let error;

      beforeEach(async () => {
        migration2.verify.rejects(new Error());
        migration2.rollback.rejects(new Error);

        bunyanMock.expects('error');

        try {
          result = await init();
        } catch (e) {
          error = e;
        }
      });

      it('calls migration.setup', () => {
        expect(migration1.setup.called).to.be.true();
        expect(migration2.setup.called).to.be.true();
      });

      it('calls migration.verify', () => {
        expect(migration1.verify.called).to.be.true();
        expect(migration2.verify.called).to.be.true();
      });

      it('calls rollback on migration 2', () => {
        expect(migration1.rollback.called).to.be.false();
        expect(migration2.rollback.called).to.be.true();
      });
    });
  });

  describe('init to 1 from 1', () => {
    beforeEach(async () => {
      getCurrentVersion.resolves(1);
      initTo = proxyquire(
        '../../../../src/arango/init/initTo',
        {
          './ensureDb': ensureDb,
          './getCurrentVersion': getCurrentVersion,
          '../../logger': { get: () => logTemplate },
          '../v1': migration1
        });
      init = initTo(1);
      result = await init();
    });

    it('calls ensureDb', () => {
      expect(ensureDb.called).to.be.true();
    });

    it('does not call migration.setup', () => {
      expect(migration1.setup.called).to.be.false();
    });

    it('does not call migration.verify', () => {
      expect(migration1.verify.called).to.be.false();
    });

    it('does not call rollback', () => {
      expect(migration1.rollback.called).to.be.false();
    });
  });
});