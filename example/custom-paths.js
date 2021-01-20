const mongoose = require('mongoose');
const mongooseErrorHandler = require('../');

const schema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    maxlength: 10
  },
});

const model = mongoose.model('person', schema);

/* Example 1: Paths original message error */
const o1 = new model({});
o1.save(function (err, doc) {
  if (err) {
    const error = mongooseErrorHandler(err, {
      paths: {
        name: { original: true }
      }
    });
    console.log(error);
    /**
     * person validation failed: name: Path `name` is required.
     */
  }
});

/* Example 2: Paths kind original message error */
const o2 = new model({});
o2.save(function (err, doc) {
  if (err) {
    const error = mongooseErrorHandler(err, {
      paths: {
        name: { original: true, kind: 'required' }
      }
    });
    console.log(error);
    /**
     * person validation failed: name: Path `name` is required.
     */
  }
});

/* Example 3: Paths custom messages */
const o3 = new model({ name: 'aaaaaaaaaaa' });
o3.save(function (err, doc) {
  if (err) {
    const error = mongooseErrorHandler(err, {
      paths: {
        name: { message: 'name length must be less than or equal to {maxlength} characters long' }
      }
    });
    console.log(error);
    /**
     * Error [MongooseValidatorError]: name ength must be less than or equal to 10 characters long
     * name: 'MongooseValidatorError',
     * path: 'name',
     * kind: 'maxlength',
     * value: 'aaaaaaaaaaa
     */
  }
});

/* Example 4: Paths custom messages */
const o4 = new model({ name: 'aaaaaaaaaaa' });
o4.save(function (err, doc) {
  if (err) {
    const error = mongooseErrorHandler(err, {
      paths: {
        name: { kind: 'maxlength', message: 'name length must be less than or equal to {maxlength} characters long' }
      }
    });
    console.log(error);
    /**
     * Error [MongooseValidatorError]: name ength must be less than or equal to 10 characters long
     * name: 'MongooseValidatorError',
     * path: 'name',
     * kind: 'maxlength',
     * value: 'aaaaaaaaaaa
     */
  }
});