# Mongoose Validation Failed Handler

## Usage

```javascripts
const mongooseErrorHandler = require('mongoose-validation-error-message-handler');

const error = mongooseErrorHandler(mongoose.Error.ValidationError, {
    messages: {
      [kind]: String
    },
    paths: {
      [path]: Object
    }
});
```