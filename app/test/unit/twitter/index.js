const { expect } = require('code');
const { beforeEach, describe, it } = exports.lab = require('lab').script();
const proxyquire = require('proxyquire').noCallThru();

let twitter;
const getAccessToken = {};
const getAuthenticationRedirectUri = {};
const getRequestToken = {};

describe('twitter', () => {
  beforeEach(() => {
    twitter = proxyquire('../../../src/twitter', {
      './getAccessToken': getAccessToken,
      './getAuthenticationRedirectUri': getAuthenticationRedirectUri,
      './getRequestToken': getRequestToken
    });
  });

  describe('getAccessToken', () => {
    it('exists', () => {
      expect(twitter.getAccessToken).to.exist();
    });
  });

  describe('getAuthenticationRedirectUri', () => {
    it('exists', () => {
      expect(twitter.getAuthenticationRedirectUri).to.exist();
    });
  });

  describe('getRequestToken', () => {
    it('exists', () => {
      expect(twitter.getRequestToken).to.exist();
    });
  });
});