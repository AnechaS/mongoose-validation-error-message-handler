type ValidatorMessages = {
  base?: string;
  required?: string;
  enum?: string;
  validate?: string;
  unique?: string;
  buffer?: string;
  boolean?: string;
  objectId?: string;
  map?: string;
  string?: string;
  maxlength?: string;
  minlength?: string;
  regexp?: string;
  number?: string;
  'number.max'?: string;
  'number.min'?: string;
  date?: string;
  'date.max'?: string;
  'date.min'?: string;
};

type Paths = {
  [path: string]: {
    origin?: Boolean;
    kind?: string;
    message?: string;
  };
};

declare function mongooseValidationErrorHandler(error: Error, options?: { messages?: ValidatorMessages, paths?: Paths }): Error;
declare namespace mongooseValidationErrorHandler {}

export = mongooseValidationErrorHandler;
