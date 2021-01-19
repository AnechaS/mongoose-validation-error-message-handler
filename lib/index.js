const { defaultsDeep, lowerFirst, isObject, omit, isEmpty } = require('lodash');
const format = require('string-template');
const messages = require('./messages');
const { transformsError, errorx } = require('./utils');

function mongooseErrorHandler(error, options) {
  options = defaultsDeep(options, {
    capitalize: false,
    humanize: false,
    messages: messages,
    paths: {},
  });

  if (error.name === 'ValidationError') {
    const attr = Object.keys(error.errors).shift();
    const err = error.errors[attr];
    const { path, kind, value, properties, stringValue } = transformsError(err);
    const ex = errorx({ path, kind, value });
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
        return ex(err.message);
      }

      if (po.message && (isEmpty(po.kind) || (po.kind && po.kind === kind))) {
        return ex(format(po.message, agrs));
      }
    }

    if (options.messages[kind]) {
      return ex(format(options.messages[kind], agrs));
    }

    return ex(format(options.messages.base, agrs));
  }

  return error;
}

module.exports = mongooseErrorHandler;
