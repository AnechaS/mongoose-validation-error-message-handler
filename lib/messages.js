module.exports = {
  base: '{path} is invalid',
  required: '{path} is required',
  enum: '{path} is invalid',

  string: '{path} must be a string',
  maxlength: '{path} length must be less than or equal to {maxlength} characters long',
  minlength: '{path} length must be at least {minlength} characters long',
  regexp: '{path} format is invalid',

  number: '{path} must be a number',
  'number.max': '{path} must be greater than or equal to {max}',
  'number.min': '{path} must be less than or equal to {{#limit}}',

  date: '{path} must be a date',
  'date.max': '{path} must be less than or equal to {max}',
  'date.min': '{path} must be greater than or equal to {min}',

  buffer: '{path} must be a buffer',
  boolean: '{path} must be a boolean',
  objectId: '{path} must be a objectId',
  map: '{path} must be a map',
};
