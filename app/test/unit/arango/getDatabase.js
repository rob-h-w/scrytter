const { expect } = require('code');
const { beforeEach, describe, it } = exports.lab = require('lab').script();
const proxyquire = require('proxyquire').noCallThru();
const sinon = require('sinon');

const getDatabase = require('../../../src/arango/getDatabase');

describe('getDatabase', () => {
  it('is a function', () => {
    expect(getDatabase).to.be.a.function();
  });

  it('returns a database instance', () => {
    expect(getDatabase()).to.exist();
  });
});
