const { expect } = require('code');
const { beforeEach, describe, it } = exports.lab = require('lab').script();
const proxyquire = require('proxyquire').noCallThru();
const sinon = require('sinon');

let db;
let getDatabase;
let setAccessKeys;

describe('setAccessKeys', () => {
  beforeEach(() => {
    db = {};
    getDatabase = sinon.stub().returns(db);
    setAccessKeys = proxyquire(
      '../../../src/arango/setAccessKeys',
      {
        './getDatabase': getDatabase
      }
    );
  });

  it('is a function', () => {
    expect(setAccessKeys).to.be.a.function();
  });

  it('gets the database', () => {
    setAccessKeys();
    expect(getDatabase.called).to.be.true();
  });
});
