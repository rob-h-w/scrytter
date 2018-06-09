# scrytter

Scry your Twitter feed.

---
## Getting Started

1. Clone the repository.
1. Install docker & docker-compose.
1. Create a file called `.env` at the root of the cloned project.
    1. Populate Twitter client credentials:
       ``` bash
       TWITTER_KEY=your key
       TWITTER_SECRET=your secret
       ```
    1. Populate Arango DB root password:
       ``` bash
       ARANGO_ROOT_PASSWORD=a password
       ```
    1. Populate the Redis DB root password:
       ``` bash
       REDIS_ROOT_PASSWORD=another password
       ```
    1. Populate the user crypto key for storing secrets.
       ``` bash
       USER_CRYPTO_KEY=a secret key - keys to the kingdom.
       ```
1. <a name="integration-test-env"></a> To run the integration tests, add the following values to `.env`:
    1. Your test Twitter access token:
       ``` bash
       TWITTER_TEST_ACCESS_TOKEN=your token
       ```
    1. Your test Twitter access secret:
       ``` bash
       TWITTER_TEST_ACCESS_TOKEN_SECRET=your secret
       ```
    1. Your test Twitter user ID.
       ``` bash
       TWITTER_TEST_USER_ID=your user ID
       ```
    1. Your screen name.
       ``` bash
       TWITTER_TEST_SCREEN_NAME=your screen name
       ```
    If you're using Replayer in playback mode, you don't need to use real values for the Twitter
    test tokens - the integration tests won't actually hit Twitter servers.
1. Run:
   ``` bash
   $ docker-compose up -d --build
   ```
   This starts the backing database and the web application.
1. Go to `localhost:8925`.

---
## Debugging
1. Run:
   ``` bash
   $ docker-compose -f docker-compose.yml -f docker-compose.debug.yml up -d --build app
   ```
   This starts the backing database & the web application in debug mode.
   The web app won't run until you attach a debugger.
1. Attach a debugger on port `8926`.

## Testing
Any of the following tests can be debugged on port `8927`.

### Unit
Run:
``` bash
$ docker-compose -f docker-compose.yml -f docker-compose.test.yml up --build unit
```

### Integration
To use replayer to replay integration tests, refer to [setting up the environment variables](#integration-test-env), then run:
``` bash
$ docker-compose -f docker-compose.yml -f docker-compose.test.yml up --build integration
```

### Integration - recording
This sets replayer to record HTTP transactions for later playback. This requires manual intervention for some tests because the authentication callback URI must be pulled out of the code & called manually.
``` bash
$ docker-compose -f docker-compose.yml -f docker-compose.test.yml up -build integration-record
```
Note that the generated recordings are in the recently terminated docker container.
These must be retrieved manually. The test outputs where they are to be found in the container.
