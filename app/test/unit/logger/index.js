const { expect } = require('code');
const { after, afterEach, before, beforeEach, describe, it } = exports.lab = require('lab').script();
const proxyquire = require('proxyquire').noCallThru();
const sinon = require('sinon');

describe('logger', () => {
  const oldVariables = {};
  const relevantEnvironmentVariables = [
    'LOG_STDOUT_LEVEL',
    'LOG_FILE_LEVEL',
    'LOG_FILE',
    'LOG_ROTATE_PERIOD',
    'LOG_RETENTION_COUNT'
  ];

  let bunyan;
  let logger;
  let loggerStub;

  beforeEach(() => {
    loggerStub = {};
    loggerStub.child = sinon.stub().returns(loggerStub);
    bunyan = {
      createLogger: sinon.stub().returns(loggerStub)
    };
  });

  describe('with custom environment variables', () => {
    beforeEach(() => {
      relevantEnvironmentVariables.forEach(env => {
        oldVariables[env] = process.env[env];
      });

      process.env.LOG_STDOUT_LEVEL = 'info';
      process.env.LOG_FILE_LEVEL = 'warn';
      process.env.LOG_FILE = '/a/path.log';
      process.env.LOG_ROTATE_PERIOD = '2d';
      process.env.LOG_RETENTION_COUNT = 2;

      logger = proxyquire('../../../src/logger',
        {
          'bunyan': bunyan
        });
    });

    afterEach(() => {
      relevantEnvironmentVariables.forEach(env => {
        process.env[env] = oldVariables[env];
      });
    });

    it('initialises the logger with the environment variables', () => {
      expect(bunyan.createLogger.calledOnce).to.be.true();
      expect(bunyan.createLogger.firstCall.args).to.equal([{
        name: 'scrytter',
        streams: [{
          count: 2,
          level: 'warn',
          path: '/a/path.log',
          period: '2d',
          type: 'rotating-file'
        },
        {
          level: 'info',
          stream: process.stdout
        }]
      }]);
    });
  });

  describe('with no relevant environment variables', () => {
    beforeEach(() => {
      relevantEnvironmentVariables.forEach(env => {
        oldVariables[env] = process.env[env];
        process.env[env] = '';
      });

      logger = proxyquire('../../../src/logger',
        {
          'bunyan': bunyan
        });
    });

    afterEach(() => {
      relevantEnvironmentVariables.forEach(env => {
        process.env[env] = oldVariables[env];
      });
    });

    it('initialises the logger with the correct defaults', () => {
      expect(bunyan.createLogger.calledOnce).to.be.true();
      expect(bunyan.createLogger.firstCall.args).to.equal([{
        name: 'scrytter',
        streams: [{
          count: 3,
          level: 'error',
          path: '/var/log/scrytter.log',
          period: '1d',
          type: 'rotating-file'
        },
        {
          level: 'debug',
          stream: process.stdout
        }]
      }]);
    });

    it('has a get method', () => {
      expect(logger.get).to.exist();
      expect(logger.get).to.be.a.function();
    });

    describe('get', () => {
      describe('unable to resolve the calling file', () => {
        let ErrorStub;
        let errorStub;

        beforeEach(() => {
          errorStub = {
            stack: [
              {
                getFileName: sinon.stub().returns('me.js'),
                getLineNumber: sinon.stub().returns(2)
              },
              {
                getFileName: sinon.stub().returns('me.js'),
                getLineNumber: sinon.stub().returns(1)
              }
            ]
          };
          ErrorStub = sinon.stub().returns(errorStub);

          logger = proxyquire('../../../src/logger',
            {
              'bunyan': bunyan,
              './error': ErrorStub
            });
        });

        it('throws', () => {
          expect(() => logger.get()).to.throw();
        });
      });

      describe('success', () => {
        let lImpl;

        beforeEach(() => {
          logger = proxyquire('../../../src/logger',
            {
              'bunyan': bunyan
            });

          lImpl = logger.get(); // update the line number in the test step.
        });

        it('returns a logger implementation', () => {
          expect(lImpl).to.exist();
          expect(lImpl).to.equal(loggerStub);
        });

        it('extracts the correct file name & line number', () => {
          expect(loggerStub.child.calledOnce).to.be.true();
          expect(loggerStub.child.firstCall.args).to.equal([
            {
              line: 154,
              path: __filename
            }
          ]);
        });
      });
    });
  });
});
