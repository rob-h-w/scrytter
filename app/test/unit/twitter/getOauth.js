const { expect } = require('code');
const { describe, beforeEach, it } = exports.lab = require('lab').script();
const oAuth = require('oauth');
const proxyquire = require('proxyquire').noCallThru();
const sinon = require('sinon');

let getOauth;

const oauth = {};

describe('getOauth', () => {
  beforeEach(() => {
    getOauth = proxyquire('../../../src/twitter/getOauth', {
      'oauth': {
        OAuth: sinon.stub().returns(oauth)
      }
    });
  });

  it('is a function', () => {
    expect(getOauth).to.be.a.function();
  });

  it('returns an OAuth', () => {
    expect(getOauth()).to.equal(oauth);
  });
});
