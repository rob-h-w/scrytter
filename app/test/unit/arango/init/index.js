const { expect } = require('code');
const { beforeEach, describe, it } = exports.lab = require('lab').script();
const proxyquire = require('proxyquire').noCallThru();
const sinon = require('sinon');

describe('arango/init', () => {
  let init;
  let initFn;
  let initTo;

  beforeEach(() => {
    initFn = sinon.stub();
    initTo = sinon.stub().returns(initFn);
    init = proxyquire(
      '../../../../src/arango/init',
      {
        './initTo': initTo
      });
  });

  it('exists', () => {
    expect(init).to.exist();
  });

  it('is a function', () => {
    expect(init).to.be.a.function();
  });

  it('selects the right desired version', () => {
    expect(initTo.calledOnceWithExactly(1)).to.be.true();
  });

  it('returns the result of initTo', () => {
    expect(init).to.equal(initFn);
  });
});