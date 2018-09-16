const bunyan = require('bunyan');
const { expect } = require('code');
const { afterEach, after, beforeEach, before, describe, it } = exports.lab = require('lab').script();
const mockery = require('mockery');
const nock = require('nock');
const sinon = require('sinon');

const mockArango = require('./mockArango');
const mockRedis = require('./mockRedis');

const logTemplate = bunyan.createLogger({
  name: 'test'
});
const root = 'http://localhost';

describe('/auth_callback', () => {
  let application;
  let arangojs;
  let arangoMocks;
  let bunyanMock;
  let bunyanStub;
  let redisMocks;
  let response;
  let server;

  before(() => {
    nock.disableNetConnect();
  });

  after(() => {
    nock.enableNetConnect();
  });

  beforeEach(async () => {
    arangoMocks = mockArango();
    arangojs = arangoMocks.arangojs;
    mockery.registerMock('arangojs', arangojs);

    bunyanMock = sinon.mock(logTemplate);
    bunyanMock.expects('child').atLeast(1).returns(logTemplate);
    bunyanMock.expects('info');
    bunyanStub = {
      createLogger: sinon.stub().returns(logTemplate)
    };
    mockery.registerMock('bunyan', bunyanStub);

    redisMocks = mockRedis();
    mockery.registerMock('redis', redisMocks.redis);
    mockery.enable({ useCleanCache: true });
    mockery.warnOnUnregistered(false);
    application = require('../../src/application');
    server = await application.start();
  });

  afterEach(() => {
    server.stop();
    mockery.disable();
    mockery.deregisterAll();
    bunyanMock.verify();
    bunyanMock.restore();
    arangoMocks.reset();
    redisMocks.reset();
  });

  describe('successful path', () => {
    beforeEach(async () => {
      nock(
        'https://api.twitter.com',
        {
          reqheaders: {
            authorization: /OAuth oauth_consumer_key=\"[0-9a-zA-Z]+\",oauth_nonce=\"[0-9a-zA-Z]+\",oauth_signature_method=\"HMAC-SHA1\",oauth_timestamp=\"[0-9]+\",oauth_token=\"token\",oauth_verifier=\"verifier\",oauth_version=\"1.0A\",oauth_signature=\"[0-9a-zA-Z=%]+\"/
          }
        }
      )
        .post('/oauth/access_token')
        .reply(
          200,
          {
            oauth_token: 'access token',
            user_id: 12444,
            screen_name: 'snooples',
            oauth_token_secret: 'shhh'
          }
        );
      redisMocks.rState.token = 'value';
      response = await server.inject({
        method: 'GET',
        url: `${root}/auth_callback?oauth_token=token&oauth_verifier=verifier`
      });
    });

    it('returns 200', () => {
      expect(response.statusCode).to.equal(200);
    });
  });

  function unreachableWith(expectedStatus) {
    describe(`twitter is unreachable with ${expectedStatus}`, () => {
      beforeEach(async () => {
        nock(
          'https://api.twitter.com',
          {
            reqheaders: {
              authorization: /OAuth oauth_consumer_key=\"[0-9a-zA-Z]+\",oauth_nonce=\"[0-9a-zA-Z]+\",oauth_signature_method=\"HMAC-SHA1\",oauth_timestamp=\"[0-9]+\",oauth_token=\"token\",oauth_verifier=\"verifier\",oauth_version=\"1.0A\",oauth_signature=\"[0-9a-zA-Z=%]+\"/
            }
          }
        )
          .post('/oauth/access_token')
          .reply(
            expectedStatus
          );
        redisMocks.rState.token = 'value';
        bunyanMock.expects('error');
        response = await server.inject({
          method: 'GET',
          url: `${root}/auth_callback?oauth_token=token&oauth_verifier=verifier`
        });
      });

      it(`returns ${expectedStatus}`, () => {
        expect(response.statusCode).to.equal(expectedStatus);
      });
    });
  }

  unreachableWith(502);
  unreachableWith(503);
  unreachableWith(504);

  describe('Unreachable with ECONNREFUSED', () => {
    beforeEach(async () => {
      const error = new Error('connect ECONNREFUSED');
      error.code = 'ECONNREFUSED';
      error.errno = 'ECONNREFUSED';
      error.syscall = 'connect';
      nock(
        'https://api.twitter.com',
        {
          reqheaders: {
            authorization: /OAuth oauth_consumer_key=\"[0-9a-zA-Z]+\",oauth_nonce=\"[0-9a-zA-Z]+\",oauth_signature_method=\"HMAC-SHA1\",oauth_timestamp=\"[0-9]+\",oauth_token=\"token\",oauth_verifier=\"verifier\",oauth_version=\"1.0A\",oauth_signature=\"[0-9a-zA-Z=%]+\"/
          }
        }
      )
        .post('/oauth/access_token')
        .replyWithError(error);
      redisMocks.rState.token = 'value';
      bunyanMock.expects('error');
      response = await server.inject({
        method: 'GET',
        url: `${root}/auth_callback?oauth_token=token&oauth_verifier=verifier`
      });
    });

    it('returns 500', () => {
      expect(response.statusCode).to.equal(500);
    });

    it('Blames Twitter', () => {
      expect(response.result.message).to.equal('Problem with Twitter.');
    });
  });

  describe('Unreachable with ENOTFOUND', () => {
    beforeEach(async () => {
      const error = new Error('getaddrinfo ENOTFOUND');
      error.code = 'ENOTFOUND';
      error.errno = 'ENOTFOUND';
      error.syscall = 'getaddrinfo';
      error.hostname = 'api.twitter.com';
      nock(
        'https://api.twitter.com',
        {
          reqheaders: {
            authorization: /OAuth oauth_consumer_key=\"[0-9a-zA-Z]+\",oauth_nonce=\"[0-9a-zA-Z]+\",oauth_signature_method=\"HMAC-SHA1\",oauth_timestamp=\"[0-9]+\",oauth_token=\"token\",oauth_verifier=\"verifier\",oauth_version=\"1.0A\",oauth_signature=\"[0-9a-zA-Z=%]+\"/
          }
        }
      )
        .post('/oauth/access_token')
        .replyWithError(error);
      redisMocks.rState.token = 'value';
      bunyanMock.expects('error');
      response = await server.inject({
        method: 'GET',
        url: `${root}/auth_callback?oauth_token=token&oauth_verifier=verifier`
      });
    });

    it('returns 500', () => {
      expect(response.statusCode).to.equal(500);
    });

    it('Blames Twitter', () => {
      expect(response.result.message).to.equal('Problem with Twitter.');
    });
  });
});
