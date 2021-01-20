const express = require('express');
const mongoose = require('mongoose');
const mongooseErrorHandler = require('../');

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