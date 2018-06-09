const sinon = require('sinon');

module.exports = function mockRedis() {
  const rState = {};
  const rClient = {
    __proto__: {},
    get: sinon.spy((key, callback) => {
      if (rState[key]) {
        callback(null, rState[key]);
      } else {
        callback(new Error(`${key} not set.`));
      }
    }),
    on: sinon.stub(),
    set: sinon.spy((key, value) => {
      rState[key] = value;
    })
  };

  for (let key in rClient) {
    const value = rClient[key];
    rClient.__proto__[key] = value;
  }
  const redis = {
    createClient: sinon.stub().resolves(rClient)
  };

  return {
    rState,
    redis,
    reset: () => {}
  };
};
