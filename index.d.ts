type ValidatorMessages = {
  base: String,
  required: String,
  enum: String,
  validate: String,
  unique: String,
  buffer: String,
  boolean: String,
  objectId: String,
  map: String,
  string: String,
  maxlength: String,
  minlength: String,
  regexp: String,
  number: String,
  'number.max': String,
  'number.min': String,
  date: String,
  'date.max': String,
  'date.min': String,
}

type Paths = {
  [path: string]: { origin: Boolean, kind: String, message: String }
}

declare function mongooseValidationErrorHandler(error: Error, options?: { messages?: ValidatorMessages, paths?: Paths }): Error;
declare namespace mongooseValidationErrorHandler {}

export = mongooseValidationErrorHandler;