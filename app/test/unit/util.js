const assert = require('assert');
const boom = require('boom');
const { expect } = require('code');
const { after, before, describe, beforeEach, it } = exports.lab = require('lab').script();
const proxyquire = require('proxyquire').noCallThru();
const sinon = require('sinon');

describe('util', () => {
  describe('boomifyStatusCode', () => {
    const { boomifyStatusCode } = require('../../src/util');

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
      });
    });
  });

  describe('handleError', () => {
    const { handleError } = require('../../src/util');

    before(() => {
      sinon.stub(console, 'error');
    });

    after(() => {
      console.error.restore();
    });

    const bException = boom.badRequest();

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
      });
    });
  });
});
