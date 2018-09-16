const bunyan = require('bunyan');
const { expect } = require('code');
const { afterEach, after, beforeEach, before, describe, it } = exports.lab = require('lab').script();
const mockery = require('mockery');
const nock = require('nock');
const sinon = require('sinon');

const mockArango = require('./mockArango');
const mockRedis = require('./mockRedis');

const root = 'http://localhost';

const logTemplate = bunyan.createLogger({
  name: 'test'
});
const oauth_token = 'oauth_token';
const oauth_token_secret = 'oauth secret';
const results = {};

describe('/authenticate', () => {
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
            authorization: /OAuth oauth_callback=\"[0-9a-zA-Z%_-]+\",oauth_consumer_key=\"[0-9a-zA-Z]+\",oauth_nonce=\"[0-9a-zA-Z]+\",oauth_signature_method=\"HMAC-SHA1\",oauth_timestamp=\"[0-9]+\",oauth_version=\"1.0A\",oauth_signature=\"[0-9a-zA-Z=%]+\"/,
            'content-type': 'application/x-www-form-urlencoded'
          }
        }
      )
        .post('/oauth/request_token')
        .reply(
          200,
          `oauth_token=${oauth_token}&oauth_token_secret=${oauth_token_secret}`
        );
      response = await server.inject({
        method: 'POST',
        url: `${root}/authenticate`
      });
    });

    it('returns 200', () => {
      expect(response.statusCode, JSON.stringify(response.result), null, 2).to.equal(200);
    });

    it('returns the expected callback', () => {
      expect(response.result.redirect).to.equal('https://api.twitter.com/oauth/authenticate?oauth_token=oauth_token');
    });
  });
});
