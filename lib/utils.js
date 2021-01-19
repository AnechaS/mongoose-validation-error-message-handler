const { lowerFirst, omit, pickBy, isUndefined } = require('lodash');

/**
 * Get mongoose validator error data.
 * @param {Error} error
 * @return {Object}
 */
exports.transformsError = function (error) {
  const o = {};
  o.path = error.path;
  o.value = error.value;
  o.stringValue = error.stringValue;
  o.message = error.message;

  if (error.kind) {
    o.kind = lowerFirst(error.kind);
  }
  
  if (typeof error.properties !== 'undefined') {
    o.properties = omit(error.properties, [
      'validator',
      'message',
      'type',
      'path',
      'value',
    ]);

    switch (o.kind) {
      case 'max': {
        if (typeof o.properties['max'] === 'number') {
          o.kind = 'number.max';
        } else {
          o.kind = 'date.max';
        }
        break;
      }
      case 'min': {
        if (typeof o.properties['min'] === 'number') {
          o.kind = 'number.min';
        } else {
          o.kind = 'date.min';
        }
        break;
      }
      default: {
        break;
      }
    }
  }

  return pickBy(o, (o) => typeof o !== 'undefined');
};

/**
 * Mongoose validator error
 *
 * @param {Object} attributes Error attributes
 * @return {Error}
 *
 * @example
 * error({ message, path, kind, value });
 */
exports.errorx = function ({ path, kind, value }) {
  return function (message) {
    let error = new Error(message);
    error.name = 'MongooseValidatorError';
    error.path = path;
    error.kind = kind;
    error.value = value;
    return error;
  };
};
