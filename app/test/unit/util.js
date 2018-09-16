const assert = require('assert');
const boom = require('boom');
const bunyan = require('bunyan');
const { expect } = require('code');
const { afterEach, beforeEach, describe, it } = exports.lab = require('lab').script();
const proxyquire = require('proxyquire').noCallThru();
const sinon = require('sinon');

const logTemplate = bunyan.createLogger({
  name: 'test'
});

describe('util', () => {
  let bunyanMock;
  let util;

  beforeEach(() => {
    bunyanMock = sinon.mock(logTemplate);
    util = proxyquire('../../src/util', {
      './logger': { get: () => logTemplate }
    });
  });

  afterEach(() => {
    bunyanMock.restore();
  });

  describe('boomifyStatusCode', () => {
    let boomifyStatusCode;

    beforeEach(() => {
      boomifyStatusCode = util.boomifyStatusCode;
    });

    [
      {
        name: 'null root',
        exceptionType: assert.AssertionError,
        params: [null]
      },
      {
        name: 'bad selector',
        exceptionType: assert.AssertionError,
        params: [{}, 2]
      },
      {
        name: 'absent statusCode',
        exceptionType: assert.AssertionError,
        params: [{}]
      },
      {
        name: 'bad statusCode type',
        exceptionType: assert.AssertionError,
        params: [{ statusCode: 0.5 }]
      },
      {
        name: 'bad statusCode value',
        exceptionType: assert.AssertionError,
        params: [{ statusCode: 1000 }]
      },
      {
        name: 'with default selector',
        boomified: boom.unauthorized(),
        params: [{ statusCode: 401 }]
      },
      {
        name: 'with custom string selector',
        boomified: boom.unauthorized(),
        params: [{ stootusCode: 401 }, 'stootusCode']
      },
      {
        name: 'with function selector',
        boomified: boom.unauthorized(),
        params: [{ code: 1 }, (obj) => { return obj.code + 400; }]
      },
      {
        name: 'Bad Gateway',
        boomified: boom.badGateway(),
        params: [{ statusCode: 502 }]
      },
      {
        name: 'Service Unavailable',
        boomified: boom.serverUnavailable(),
        params: [{ statusCode: 503 }]
      },
      {
        name: 'Gateway Timeout',
        boomified: boom.gatewayTimeout(),
        params: [{ statusCode: 504 }]
      }
    ].forEach((c) => {
      it(c.name, () => {
        let e;
        let boomified;

        try {
          boomified = boomifyStatusCode(...c.params);
        } catch (exception) {
          e = exception;
        }

        if (c.exceptionType) {
          expect(e).to.be.instanceOf(c.exceptionType);
        } else {
          expect(e).not.to.exist();
          expect(boomified.isBoom).to.be.true();
          expect(boomified.statusCode).to.equal(c.boomified.statusCode);
        }

        bunyanMock.verify();
      });
    });
  });

  describe('handleError', () => {
    const bException = boom.badRequest();

    let handleError;

    beforeEach(() => {
      handleError = util.handleError;
    });

    [
      {
        name: 'null error',
        exceptionType: assert.AssertionError,
        params: [null]
      },
      {
        name: 'normal error',
        isBoom: true,
        params: [new Error()]
      },
      {
        name: 'non-error object',
        isBoom: true,
        params: [{}, (obj) => { return 401 }]
      },
      {
        name: 'isBoom',
        exception: bException,
        params: [bException]
      }
    ].forEach((c) => {
      it(c.name, () => {
        let e;

        if (c.params[0] !== null) {
          bunyanMock.expects('error');
        }

        try {
          handleError(...c.params);
        } catch (exception) {
          e = exception;
        }

        if (c.exceptionType) {
          expect(e).to.be.instanceOf(c.exceptionType);
        } else if (c.exception) {
          expect(e).to.equal(c.exception);
        } else if (c.isBoom) {
          expect(e.isBoom).to.be.true();
        } else {
          expect(e).not.to.exist();
        }

        bunyanMock.verify();
      });
    });
  });
});
