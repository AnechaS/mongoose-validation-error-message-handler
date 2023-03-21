type ValidatorMessages = {
  base: string;
  required: string;
  enum: string;
  validate: string;
  unique: string;
  buffer: string;
  boolean: string;
  objectId: string;
  map: string;
  string: string;
  maxlength: string;
  minlength: string;
  regexp: string;
  number: string;
  'number.max': string;
  'number.min': string;
  date: string;
  'date.max': string;
  'date.min': string;
};

type Paths = {
  [path: string]: { origin: Boolean; kind: string; message: string };
};

type Options = {
  messages?: ValidatorMessages;
  paths?: Paths;
};

declare function mongooseValidationErrorHandler(error: Error, options?: Options): Error;
declare namespace mongooseValidationErrorHandler {}

export = mongooseValidationErrorHandler;
