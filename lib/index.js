const { defaultsDeep, isEmpty, lowerFirst, omit } = require('lodash');
const format = require('string-template');
const messages = require('./messages');

/**
 * Mongoose validator error.
 * @param {Object} attributes attributes path, kind, value
 * @return {Function}
 * @example createError({ 'path', 'kind', 'value' })('message');
 */
function mongooseValidatorError({ path, kind, value }) {
  return function (message) {
    const error = new Error(message);
    error.name = 'MongooseValidatorError';
    error.path = path;
    error.kind = kind;
    error.value = value;
    return error;
  };
}

/**
 * Transforms mongoose validator error data.
 * @param {Error} error
 * @return {Object}
 */
function transformsError(error) {
  const attr = Object.keys(error.errors).shift();
  const err = error.errors[attr];
  switch (err.kind) {
    case 'ObjectID': {
      err.kind = 'objectId';
      break;
    }
    case 'user defined': {
      err.kind = 'validate';
      break;
    }
    default: {
      err.kind = lowerFirst(err.kind);
      break;
    }
  }

  if (typeof err.properties !== 'undefined') {
    err.properties = omit(err.properties, [
      'validator',
      'message',
      'type',
      'path',
      'value',
    ]);

    switch (err.kind) {
      case 'max': {
        if (typeof err.properties['max'] === 'number') {
          err.kind = 'number.max';
        } else {
          err.kind = 'date.max';
        }
        break;
      }
      case 'min': {
        if (typeof err.properties['min'] === 'number') {
          err.kind = 'number.min';
        } else {
          err.kind = 'date.min';
        }
        break;
      }
      default: {
        break;
      }
    }
  }

  return err;
}

/**
 * Mongoose validation error handler.
 * @param {Error} error 
 * @param {{messages:object, paths:object}} options 
 * @return {Error}
 */
function mongooseErrorHandler(error, options) {
  options = defaultsDeep(options, {
    capitalize: false,
    humanize: false,
    messages: messages,
    paths: {},
  });

  if (error.name === 'ValidationError') {
    const {
      path,
      kind,
      value,
      properties,
      stringValue,
      message,
    } = transformsError(error);
    const createError = mongooseValidatorError({ path, kind, value });
    const agrs = {
      path,
      value: stringValue,
      ...properties,
    };

    if (!isEmpty(options.paths) && options.paths[path]) {
      const po = options.paths[path];
      if (
        po.original === true &&
        (isEmpty(po.kind) || (po.kind && po.kind === kind))
      ) {
        return createError(message);
      }

      if (po.message && (isEmpty(po.kind) || (po.kind && po.kind === kind))) {
        return createError(format(po.message, agrs));
      }
    }

    if (options.messages[kind]) {
      return createError(format(options.messages[kind], agrs));
    }

    return createError(format(options.messages.base, agrs));
  }

  return error;
}

module.exports = exports = mongooseErrorHandler;
