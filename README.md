# Mongoose Validation Error Message Handler
is responsilbe transfroming mongoose validation error into generic form.

## Install

```bash
npm i mongoose-validation-error-message-handler
```

## Usages

### Example 1 simple

```javascript
const mongoose = require('mongoose');
const mongooseErrorHandler = require('mongoose-validation-error-message-handler');

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
     * message: "name" is required
     * name: 'MongooseValidatorError',
     * path: 'name',
     * kind: 'required',
     * value: undefined
     */
  }
});
```

### Example 2 custom messages

```javascript
const mongoose = require('mongoose');
const mongooseErrorHandler = require('mongoose-validation-error-message-handler');

const schema = new mongoose.Schema({
  name: {
    type: String,
  },
});

const model = mongoose.model('person', schema);

const object = new model({ name: {} });
object.save(function (err, doc) {
  if (err) {
    const error = mongooseErrorHandler(err, {
      messages: {
        string: '{path} must be a string'
      }
    });
    console.log(error);
    /**
     * Error [MongooseValidatorError]: name must be a string
     * message: name must be a string
     * name: 'MongooseValidatorError',
     * path: 'name',
     * kind: 'string',
     * value: {}
     */
  }
});
```

### Example 3 paths origin message

```javascript
const mongoose = require('mongoose');
const mongooseErrorHandler = require('mongoose-validation-error-message-handler');

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
    const error = mongooseErrorHandler(err, {
      paths: {
        name: { origin: true },
        nameX: { origin: true, kind: 'maxlength' },
      }
    });
    console.log(error);
    /**
     * person validation failed: name: Path `name` is required.
     */
  }
});
```

### Example 4 paths custom messages

```javascript
const mongoose = require('mongoose');
const mongooseErrorHandler = require('mongoose-validation-error-message-handler');

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
    const error = mongooseErrorHandler(err, {
      paths: {
        name: { message: 'name is required' },
        nameX: { message: 'name length must be less than or equal to {maxlength} characters long', kind: 'maxlength' },
      }
    });
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
```

### Example 5 unique
You will need to install package `mongoose-unique-validator` first.

```javascript
const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');
const mongooseErrorHandler = require('mongoose-validation-error-message-handler');

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
     * Error [MongooseValidatorError]: "name" is already exists
     * name: 'MongooseValidatorError',
     * path: 'name',
     * kind: 'unique',
     * value: "a"
     */
  }
});
```

### Example 6 server express

```javascript
const express = require('express');
const mongoose = require('mongoose');
const mongooseErrorHandler = require('mongoose-validation-error-message-handler');

mongoose.Promise = Promise;
mongoose.connect('mongodb://localhost/example', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const schema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
});

const model = mongoose.model('person', schema);

const app = express();
app.use(express.json());

app.post('/', async (req, res, next) => {
  try {
    const object = await model.create(req.body);
    res.json(object);
  } catch (error) {
    next(error)
  }
});

// catch 404 and forward to error handler
app.use((req, res, next) => {
  const err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use((err, req, res) => {
  let error = mongooseErrorHandler(err);
  if (error.name === 'MongooseValidatorError') {
    error.status = 400;
  }
  res.status(error.status || 500);
  res.json({ message: error.message });
});

app.listen(3000)
```

## Options

### messages

| Kind | Properties | Message | SchemaTypeOptions
|---------------|---------------|------------------------|---------------|
| base | `path`, `value` | {path} is invalid |
| boolean | `path`, `value` | {path} must be a boolean | type |
| buffer | `path`, `value` | {path} must be a buffer | type |
| date | `path`, `value` | {path} must be a date | type |
| date.max | `path`, `value`, `max` | {path} must be less than or equal to {max} | max |
| date.min | `path`, `value`, `min` | {path} must be greater than or equal to {min} | min |
| enum | `path`, `value`, `enumValues` | {path} is invalid | enum |
| maxlength | `path`, `value`, `maxlength` | {path} length must be less than or equal to {maxlength} characters long | maxlength |
| minlength | `path`, `value`, `minlength` | {path} length must be at least {minlength} characters long | minlength |
| map | `path`, `value` | {path} must be a Map | type |
| number | `path`, `value` | {path} must be a number | type |
| number.max | `path`, `value`, `max` | {path} must be greater than or equal to {max} | max |
| number.min | `path`, `value`, `min` | {path} must be less than or equal to {min} | min |
| objectId | `path`, `value` | {path} must be a objectId | type |
| regexp | `path`, `value`, `regexp` | {path} format is invalid | match |
| required | `path`, `value` | {path} is required | required |
| string | `path`, `value` | {path} must be a string | type |
| unique | `path`, `value` | "{path}" is already exists | unique |
| validate | `path`, `value`, `enumValues` | {path} is invalid | validate |

### paths

`path`: String
- `original`: Boolean, 
- `kind`: String, 
- `message`: String
