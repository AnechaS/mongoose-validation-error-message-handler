const mongoose = require('mongoose');
const mongooseErrorHandler = require('..');

const schema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
});

const model = mongoose.model('person', schema);

const object = new model({});
object.save(function (err, doc) {
  if (err) {
    const error = mongooseErrorHandler(err);
    console.log(error);
    /**
     * Error [MongooseValidatorError]: "name" is required
     * name: 'MongooseValidatorError',
     * path: 'name',
     * kind: 'required',
     * value: undefined
     */
  }
});
