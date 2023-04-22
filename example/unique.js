const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');
const mongooseErrorHandler = require('../');

mongoose.Promise = Promise;
mongoose.connect('mongodb://localhost/example', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

mongoose.plugin(uniqueValidator);

const schema = new mongoose.Schema({
  name: {
    type: String,
    unique: true,
  },
});

const model = mongoose.model('person', schema);

const object = new model({ name: 'a' });
object.save(function (err, doc) {
  if (err) {
    const error = mongooseErrorHandler(err);
    console.log(error);
    /**
     * Error [MongooseValidatorError]: "name" already exists
     * name: 'MongooseValidatorError',
     * path: 'name',
     * kind: 'unique',
     * value: "a"
     */
  }
});


