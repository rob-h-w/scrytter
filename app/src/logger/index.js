const bunyan = require('bunyan');
const Err = require('./error');

const { name } = require('../../package.json');

const LOG_STDOUT_LEVEL = process.env.LOG_STDOUT_LEVEL || 'debug';
const LOG_FILE_LEVEL = process.env.LOG_FILE_LEVEL || 'error';
const LOG_FILE = process.env.LOG_FILE || '/var/log/scrytter.log';
const LOG_ROTATE_PERIOD = process.env.LOG_ROTATE_PERIOD || '1d';
const LOG_RETENTION_COUNT = process.env.LOG_RETENTION_COUNT || 3;

const logger = bunyan.createLogger({
  name,
  streams: [{
    count: Number(LOG_RETENTION_COUNT),
    level: LOG_FILE_LEVEL,
    path: LOG_FILE,
    period: LOG_ROTATE_PERIOD,
    type: 'rotating-file'
  },
  {
    level: LOG_STDOUT_LEVEL,
    stream: process.stdout
  }]
});

function getCallingFileAndLine() {
  const prepareStackTrace = Err.prepareStackTrace;

  const err = new Err();

  Err.prepareStackTrace = (ignored, stack) => stack;

  try {
    const thisFile = err.stack.shift().getFileName();

    while (err.stack.length) {
      const stack = err.stack.shift();
      const callingFile = stack.getFileName();

      if(thisFile !== callingFile) {
        return {
          line: stack.getLineNumber(),
          path: callingFile
        };
      }
    }
  } finally {
    Err.prepareStackTrace = prepareStackTrace;
  }

  throw new Error('Could not get the calling file.');
}

module.exports = {
  get: () => {
    return logger.child(getCallingFileAndLine());
  }
};