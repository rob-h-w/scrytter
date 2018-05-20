const { expect } = require('code');
const { beforeEach, describe, it } = exports.lab = require('lab').script();
const proxyquire = require('proxyquire').noCallThru();
const sinon = require('sinon');

let arango;

describe('arango', () => {
  beforeEach(() => {
    arango = proxyquire(
      '../../../src/arango',
      {
        './init': sinon.stub(),
        './setAccessKeys': sinon.stub()
      });
  });

  describe('setAccessKeys', () => {
    it('exists', () => {
      expect(arango.setAccessKeys).to.exist();
    });

    it('is a function', () => {
      expect(arango.setAccessKeys).to.be.a.function();
    });
  });

  describe('init', () => {
    it('exists', () => {
      expect(arango.init).to.exist();
    });

    it('is a function', () => {
      expect(arango.init).to.be.a.function();
    });
  });
});