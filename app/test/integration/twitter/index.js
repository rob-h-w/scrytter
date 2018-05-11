const { expect } = require('code');
const fs = require('fs');
const { after, before, beforeEach, describe, it } = exports.lab = require('lab').script();
const path = require('path');
const proxyquire = require('proxyquire').noPreserveCache().noCallThru();
const replayer = require('replayer');
const sinon = require('sinon');

const fixturesRoot = path.join(__dirname, 'fixtures');
[
  'TWITTER_KEY',
  'TWITTER_SECRET',
  'TWITTER_TEST_ACCESS_TOKEN',
  'TWITTER_TEST_ACCESS_TOKEN_SECRET',
  'TWITTER_TEST_USER_ID',
  'TWITTER_TEST_SCREEN_NAME'
].forEach((substitute) => replayer.substitute(substitute, () => process.env[substitute]));

const redisStore = {}
const redisClient = {
  on: sinon.stub(),
  set: sinon.spy((key, val) => {
    redisStore[key] = val;
  }),
  getAsync: sinon.spy(async (key) => {
    return redisStore[key];
  })
};
const application = {
  redis: redisClient
};
const proxyEnv = {
  '../application': {
    application,
    '@global': true
  },
  redis: {
    createClient: sinon.stub().returns(redisClient)
  }
};

const twitter = proxyquire('../../../src/twitter', proxyEnv);

const recording = process.env.VCR_MODE === 'record';

describe('twitter', () => {
  after(() => {
    // list the file contents if we generated recordings.
    if (recording) {
      const contents = fs.readdirSync(fixturesRoot);
      console.log(`\nContents of ${fixturesRoot}:\n${contents}`);
    }
  });

  describe('getAccessToken', () => {
    let accessToken;

    describe('failure', () => {
      let exception;

      beforeEach(() => {
        exception = null;
      });

      describe('request token not cached', () => {
        before(() => {
          replayer.fixtureDir(path.join(fixturesRoot, 'failure', 'request token not cached'));
        });

        beforeEach(async () => {
          try {
            await twitter.getAccessToken({
              oauth_token: 'not',
              oauth_verifier: 'there'
            });
          } catch (e) {
            exception = e;
          }
        });

        it('throws a precondition failed boom', () => {
          expect(exception).to.exist();
          expect(exception.isBoom).to.be.true();
          expect(exception.output.statusCode).to.equal(412);
        });
      });

      describe('bad request token', () => {
        before(() => {
          replayer.fixtureDir(path.join(fixturesRoot, 'failure', 'bad request token'));
        });

        beforeEach(async () => {
          try {
            redisStore.badToken = 'badSecret';
            await twitter.getAccessToken({
              oauth_token: 'badToken',
              oauth_verifier: 'badVerifier'
            });
          } catch (e) {
            exception = e;
          }
        });

        it('throws a 401 status code', () => {
          expect(exception).to.exist();
          expect(exception.statusCode).to.equal(401);
        });
      });
    });

    describe('success', () => {
      before(async () => {
        replayer.fixtureDir(path.join(fixturesRoot, 'success'));
        const uri = await twitter.getAuthenticationRedirectUri();
        const params = {
          oauth_token: 'SSIJwQAAAAAA526IAAABY0W2V04',
          oauth_verifier: '496EUfaxVwmY4tRtEhWOpk0ahlWNWGwb'
        };

        if (recording) {
          // Put a breakpoint here.
          console.log('Open', uri.redirect, '& log in.');
          // Set the params to the oauth_token & oauth_verifier values in the redirect URI query.
          console.log('Put a breakpoint here.');
        }

        accessToken = await twitter.getAccessToken(params);
      });

      it('gets an access token', () => {
        expect(accessToken).to.exist();
      });

      it('gets an access token with the right members', () => {
        expect(Object.keys(accessToken)).to.include([
          'oauth_access_token',
          'oauth_access_token_secret',
          'results'
        ]);
      });
    });
  });

  describe('getAuthenticationRedirectUri', () => {
    let redirectUri;

    describe('success', () => {
      before(() => {
        replayer.fixtureDir(path.join(fixturesRoot, 'success'));
      });

      beforeEach(async () => {
        redirectUri = await twitter.getAuthenticationRedirectUri();
      });

      it('Creates a redirectUri', () => {
        expect(redirectUri).to.exist();
        expect(redirectUri.redirect).to.exist();
        expect(redirectUri.redirect).to.match(/https:\/\/api.twitter.com\/oauth\/authenticate\?oauth_token=[a-zA-Z0-9\-_]+/);
      });
    });
  });

  describe('getRequestToken', () => {
    let requestToken;

    describe('success', () => {
      before(() => {
        replayer.fixtureDir(path.join(fixturesRoot, 'success'));
      });

      beforeEach(async () => {
        requestToken = await twitter.getRequestToken();
      });

      it('gets a request token', () => {
        expect(requestToken).to.exist();
      });
    });
  });
});
