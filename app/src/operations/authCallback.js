const { storeUser } = require('../arango');
const { getAccessToken } = require('../twitter');
const { handleError } = require('../util');

module.exports = async (request, h) => {
  let upstreamSource = null;
  try {
    upstreamSource = 'Twitter';
    const tokenResponse = await getAccessToken(request.query);
    upstreamSource = null;
    await storeUser(tokenResponse);
    return tokenResponse;
  } catch (err) {
    if (upstreamSource) {
      const errorMessage = `Problem with ${upstreamSource}.`;

      if (err instanceof Error) {
        const causedBy = err;
        err = new Error(errorMessage);
        err.causedBy = causedBy;
      } else {
        err.data = errorMessage;
      }

    }

    handleError(err);
  }
};
