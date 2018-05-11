const assert = require('assert');
const boom = require('boom');
const _ = require('lodash');

/**
 * Boomify non-error objects.
 *
 * @param {Object} root Non-error object to boomify
 * @param {*} selector Optional parameter to select where to get the status code.
 *   This can be a string as used in lodash to get properties or a function that returns the status
 *   code. Whichever option is used, an integer status code should be returned.
 *
 *   Defaults to 'statusCode'.
 */
function boomifyStatusCode(root, selector = 'statusCode') {
  assert(root, `Cannot boomify ${root}`);

  let statusCode;

  if (_.isString(selector)) {
    statusCode = _.get(root, selector);
  } else if (_.isFunction(selector)) {
    statusCode = selector(root);
  } else {
    assert.fail('Selector must be either a string or a function.');
  }

  assert(_.isInteger(statusCode), `${root}'s status code must be an integer, not ${statusCode}.`);

  switch(statusCode) {
    case 401:
      return boom.unauthorized(root);
    default:
      assert.fail(`No handler for statusCode ${statusCode}`);
  }
}

/**
 * Ensure error responses are thrown as Boom errors.
 *
 * @param {Object} err The error to ensure is boom or boomified.
 * @param {*} selector As defined by #{boomifyStatusCode}.
 */
function handleError(err, selector) {
  assert(err, 'err must exist.');

  console.error(err);
  if (!err.isBoom) {
    if (!(err instanceof Error)) {
      err = boomifyStatusCode(err, selector);
    } else {
      err = boom.boomify(err);
    }
  }

  throw err;
}

module.exports = {
  boomifyStatusCode,
  handleError
};
