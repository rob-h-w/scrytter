const sinon = require('sinon');

module.exports = function makeRedisClientStub() {
  const redisStore = {}
  return {
    on: sinon.stub(),
    set: sinon.spy((key, val) => {
      redisStore[key] = val;
    }),
    getAsync: sinon.spy(async (key) => {
      return redisStore[key];
    })
  };
};