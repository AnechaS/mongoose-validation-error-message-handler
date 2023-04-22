const mongoose = require('mongoose');
const mongooseErrorHandler = require('../');

const schema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
});

const model = mongoose.model('person', schema);

const messages = {
  base: '{path} is invalid',
  required: '{path} is required',
  enum: '{path} is invalid',
  validate: '{path} is invalid',
  unique: '{path} already exists',
  boolean: '{path} must be a boolean',
  buffer: '{path} must be a buffer',
  objectId: '{path} must be a objectId',
  map: '{path} must be a Map',
  string: '{path} must be a string',
  maxlength: '{path} length must be less than or equal to {maxlength} characters long',
  minlength: '{path} length must be at least {minlength} characters long',
  regexp: '{path} format is invalid',
  number: '{path} must be a number',
  'number.max': '{path} must be greater than or equal to {max}',
  'number.min': '{path} must be less than or equal to {min}',
  date: '{path} must be a date',
  'date.max': '{path} must be less than or equal to {max}',
  'date.min': '{path} must be greater than or equal to {min}',
}

const object = new model({});
object.save(function (err, doc) {
  if (err) {
    const error = mongooseErrorHandler(err, { messages });
    console.log(error);
    /**
     * Error [MongooseValidatorError]: name is required
     * name: 'MongooseValidatorError',
     * path: 'name',
     * kind: 'required',
     * value: undefined
     */
  }
});
