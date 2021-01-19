const mongoose = require('mongoose');
const assert = require('assert');
const mongooseErrorHandler = require('../lib');
const messages = require('../lib/messages');

mongoose.Promise = Promise;
mongoose.connect(process.env.MONGO_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

beforeEach(async () => {
  for (const key in mongoose.models) {
    const model = mongoose.models[key];
    await model.deleteMany({});
    mongoose.deleteModel(key);
  }
});

afterAll(async () => {
  await mongoose.disconnect();
});

test('should set options to default', () => {
  const options = {};
  mongooseErrorHandler({}, options);
  expect(options.capitalize).toBe(false);
  expect(options.humanize).toBe(false);
  expect(options.messages).toEqual(messages);
});

test('should set options', () => {
  const options = {
    capitalize: true,
    humanize: true,
    messages: {
      string: 'invalid',
    },
  };
  mongooseErrorHandler({}, options);
  expect(options.capitalize).toBe(true);
  expect(options.humanize).toBe(true);
  expect(options.messages).toEqual(
    Object.assign({}, messages, {
      string: 'invalid',
    })
  );
});

test('should return error', async () => {
  expect(mongooseErrorHandler({})).toEqual({});
});

test('should transform validation error with path option is set to "{origin:true}"', async () => {
  const personSchema = new mongoose.Schema({
    name: {
      type: String,
      required: true,
    },
  });

  const animalSchema = new mongoose.Schema({
    name: {
      type: String,
      required: [true, '@name is required'],
    },
  });
  const person = mongoose.model('person', personSchema);
  const animal = mongoose.model('animal', animalSchema);
  let items = [
    [{ name: 'a' }, {}],
    [{}, { name: 'a' }],
  ];

  for (let item of items) {
    try {
      await person.create(item[0]);
      await animal.create(item[1]);
    } catch (err) {
      const options = {
        paths: {
          name: { original: true },
        },
      };

      const e = mongooseErrorHandler(err, options);

      if (!Object.keys(item[0]).length) {
        expect(e.message).toBe('Path `name` is required.');
      } else {
        expect(e.message).toBe('@name is required');
      }
      expect(e.path).toBe('name');
      expect(e.kind).toBe('required');
      expect(e.value).toEqual(undefined);
    }
  }
});

test('should transform validation error with path option is set to "{origin:true, kind:String}"', async () => {
  const personSchema = new mongoose.Schema({
    name: {
      type: String,
    },
  });

  const animalSchema = new mongoose.Schema({
    name: {
      type: String,
      required: [true, '@name is required'],
    },
  });
  const person = mongoose.model('person', personSchema);
  const animal = mongoose.model('animal', animalSchema);
  let items = [
    [{ name: 'a' }, {}],
    [{ name: {} }, { name: 'a' }],
  ];

  for (let item of items) {
    try {
      await person.create(item[0]);
      await animal.create(item[1]);
    } catch (err) {
      const options = {
        paths: {
          name: { original: true, kind: 'required' },
        },
      };

      const e = mongooseErrorHandler(err, options);
      expect(e.path).toBe('name');
      if (Object.keys(item[0]).length && typeof item[0].name !== 'string') {
        expect(e.message).toBe('name must be a string');
        expect(e.kind).toBe('string');
        expect(e.value).toEqual(item[0].name);
      }
      if (!Object.keys(item[1]).length) {
        expect(e.message).toBe('@name is required');
        expect(e.kind).toBe('required');
        expect(e.value).toEqual(undefined);
      }
    }
  }
});

test('should transform validation error with path option is set to "{message:String}"', async () => {
  const personSchema = new mongoose.Schema({
    name: {
      type: String,
    },
  });

  const animalSchema = new mongoose.Schema({
    name: {
      type: String,
      required: true,
    },
  });
  const person = mongoose.model('person', personSchema);
  const animal = mongoose.model('animal', animalSchema);
  let items = [
    [{ name: 'a' }, {}],
    [{ name: {} }, { name: 'a' }],
  ];

  for (let item of items) {
    try {
      await person.create(item[0]);
      await animal.create(item[1]);
    } catch (err) {
      const options = {
        paths: {
          name: { message: '@name is invalid' },
        },
      };

      const e = mongooseErrorHandler(err, options);
      expect(e.path).toBe('name');
      expect(e.message).toBe('@name is invalid');
      if (Object.keys(item[0]).length && typeof item[0].name !== 'string') {
        expect(e.kind).toBe('string');
        expect(e.value).toEqual(item[0].name);
      }
      if (!Object.keys(item[1]).length) {
        expect(e.kind).toBe('required');
        expect(e.value).toEqual(undefined);
      }
    }
  }
});

test('should transform validation error with path option is set to "{message:String, kind:String}"', async () => {
  const personSchema = new mongoose.Schema({
    name: {
      type: String,
    },
  });

  const animalSchema = new mongoose.Schema({
    name: {
      type: String,
      required: true,
    },
  });
  const person = mongoose.model('person', personSchema);
  const animal = mongoose.model('animal', animalSchema);
  let items = [
    [{ name: 'a' }, {}],
    [{ name: {} }, { name: 'a' }],
  ];

  for (let item of items) {
    try {
      await person.create(item[0]);
      await animal.create(item[1]);
    } catch (err) {
      const options = {
        paths: {
          name: { message: '@name is invalid', kind: 'string' },
        },
      };

      const e = mongooseErrorHandler(err, options);
      expect(e.path).toBe('name');
      if (Object.keys(item[0]).length && typeof item[0].name !== 'string') {
        expect(e.message).toBe('@name is invalid');
        expect(e.kind).toBe('string');
        expect(e.value).toEqual({});
      }
      if (!Object.keys(item[1]).length) {
        expect(e.message).toBe('name is required');
        expect(e.kind).toBe('required');
        expect(e.value).toEqual(undefined);
      }
    }
  }
});

describe('required', () => {
  test('should transform error', async () => {
    try {
      const schema = new mongoose.Schema({
        name: {
          type: String,
          required: true,
        },
      });
      const model = mongoose.model('person', schema);
      await model.create({});
    } catch (err) {
      // message original: Path `name` is required.

      const e = mongooseErrorHandler(err);
      expect(e.message).toBe('name is required');
      expect(e.path).toBe('name');
      expect(e.kind).toBe('required');
      expect(e.value).toBe(undefined);
    }
  });

  test('should transform validation error when set messages', async () => {
    try {
      const schema = new mongoose.Schema({
        name: {
          type: String,
          required: true,
        },
      });
      const model = mongoose.model('person', schema);
      await model.create({});
    } catch (err) {
      // message original: Path `name` is required.

      const options = { messages: { required: '{path} is not empty' } };
      const e = mongooseErrorHandler(err, options);
      expect(e.message).toBe('name is not empty');
      expect(e.path).toBe('name');
      expect(e.kind).toBe('required');
      expect(e.value).toBe(undefined);
    }
  });
});

describe('enum', () => {
  test('should transform validation error', async () => {
    try {
      const schema = new mongoose.Schema({
        name: {
          type: String,
          enum: ['a', 'b'],
        },
      });
      const model = mongoose.model('person', schema);
      await model.create({ name: 'c' });
    } catch (err) {
      // message original: `c` is not a valid enum value for path `name`.

      const e = mongooseErrorHandler(err);
      expect(e.message).toBe('name is invalid');
      expect(e.path).toBe('name');
      expect(e.kind).toBe('enum');
      expect(e.value).toBe('c');
    }
  });

  test('should transform validation error when set messages', async () => {
    try {
      const schema = new mongoose.Schema({
        name: {
          type: String,
          enum: ['a', 'b'],
        },
      });
      const model = mongoose.model('person', schema);
      await model.create({ name: 'c' });
    } catch (err) {
      // message original: `c` is not a valid enum value for path `name`.
      const options = {
        messages: { enum: '{path} is not valid value enum {enumValues}' },
      };
      const e = mongooseErrorHandler(err, options);
      expect(e.message).toBe('name is not valid value enum a,b');
      expect(e.path).toBe('name');
      expect(e.kind).toBe('enum');
      expect(e.value).toBe('c');
    }
  });
});

describe('string', () => {
  test('should transform validation error', async () => {
    try {
      const schema = new mongoose.Schema({
        name: {
          type: String,
        },
      });
      const model = mongoose.model('person', schema);
      await model.create({ name: {} });
    } catch (err) {
      // person validation failed: name: Cast to string failed for value "{}" at path "name"

      const e = mongooseErrorHandler(err);
      expect(e.message).toBe('name must be a string');
      expect(e.path).toBe('name');
      expect(e.kind).toBe('string');
      expect(e.value).toEqual({});
    }
  });

  test('should transform validation error with message option', async () => {
    try {
      const schema = new mongoose.Schema({
        name: {
          type: String,
        },
      });
      const model = mongoose.model('person', schema);
      await model.create({ name: { x: 'c' } });
    } catch (err) {
      const options = {
        messages: { string: '{path} is not string' },
      };
      const e = mongooseErrorHandler(err, options);
      expect(e.message).toBe('name is not string');
      expect(e.path).toBe('name');
      expect(e.kind).toBe('string');
      expect(e.value).toEqual({ x: 'c' });
    }
  });
});

describe('maxlength', () => {
  test('should transform validation error', async () => {
    try {
      const schema = new mongoose.Schema({
        name: {
          type: String,
          maxlength: 5,
        },
      });
      const model = mongoose.model('person', schema);
      await model.create({ name: 'aaaaaa' });
    } catch (err) {
      // message original: Path `name` (`aaaaa`) is longer than the maximum allowed length (5).

      const e = mongooseErrorHandler(err);
      expect(e.message).toBe(
        'name length must be less than or equal to 5 characters long'
      );
      expect(e.path).toBe('name');
      expect(e.kind).toBe('maxlength');
      expect(e.value).toEqual('aaaaaa');
    }
  });

  test('should transform validation error when set messages', async () => {
    try {
      const schema = new mongoose.Schema({
        name: {
          type: String,
          maxlength: 5,
        },
      });
      const model = mongoose.model('person', schema);
      await model.create({ name: 'aaaaaa' });
    } catch (err) {
      const options = {
        messages: {
          maxlength:
            '{path} is longer than the maximum allowed length {maxlength}',
        },
      };
      const e = mongooseErrorHandler(err, options);
      expect(e.message).toBe(
        'name is longer than the maximum allowed length 5'
      );
      expect(e.path).toBe('name');
      expect(e.kind).toBe('maxlength');
      expect(e.value).toEqual('aaaaaa');
    }
  });
});

describe('minlength', () => {
  test('should transform validation error', async () => {
    try {
      const schema = new mongoose.Schema({
        name: {
          type: String,
          minlength: 5,
        },
      });
      const model = mongoose.model('person', schema);
      await model.create({ name: 'aaaa' });
    } catch (err) {
      // => person validation failed: name: Path `name` (`aaaa`) is shorter than the minimum allowed length (5).
      const e = mongooseErrorHandler(err);
      expect(e.message).toBe('name length must be at least 5 characters long');
      expect(e.path).toBe('name');
      expect(e.kind).toBe('minlength');
      expect(e.value).toEqual('aaaa');
    }
  });

  test('should transform validation error when set messages', async () => {
    try {
      const schema = new mongoose.Schema({
        name: {
          type: String,
          maxlength: 5,
        },
      });
      const model = mongoose.model('person', schema);
      await model.create({ name: 'aaaa' });
    } catch (err) {
      const options = {
        messages: {
          minlength:
            '{path} is longer than the maximum allowed length {minlength}',
        },
      };
      const e = mongooseErrorHandler(err, options);
      expect(e.message).toBe(
        'name is longer than the maximum allowed length 5'
      );
      expect(e.path).toBe('name');
      expect(e.kind).toBe('minlength');
      expect(e.value).toEqual('aaaa');
    }
  });
});

describe('regexp', () => {
  test('should transform validation error', async () => {
    try {
      const schema = new mongoose.Schema({
        name: {
          type: String,
          match: /^\S+@\S+\.\S+$/,
        },
      });
      const model = mongoose.model('person', schema);
      await model.create({ name: 'aaaa' });
    } catch (err) {
      // => person validation failed: name: Path `name` is invalid (aaaa).

      const e = mongooseErrorHandler(err);
      expect(e.message).toBe('name format is invalid');
      expect(e.path).toBe('name');
      expect(e.kind).toBe('regexp');
      expect(e.value).toEqual('aaaa');
    }
  });

  test('should transform validation error when set messages', async () => {
    try {
      const schema = new mongoose.Schema({
        name: {
          type: String,
          match: /^\S+@\S+\.\S+$/,
        },
      });
      const model = mongoose.model('person', schema);
      await model.create({ name: 'aaaa' });
    } catch (err) {
      const e = mongooseErrorHandler(err, {
        messages: {
          regexp: '{path} is invalid',
        },
      });
      expect(e.message).toBe('name is invalid');
      expect(e.path).toBe('name');
      expect(e.kind).toBe('regexp');
      expect(e.value).toEqual('aaaa');
    }
  });
});

describe('number', () => {
  test('should transform validation error', async () => {
    try {
      const schema = new mongoose.Schema({
        name: {
          type: String,
        },
        age: Number,
      });
      const model = mongoose.model('person', schema);
      await model.create({ age: 'aaaa' });
    } catch (err) {
      // => person validation failed: age: Cast to Number failed for value "aaaa" at path "age"

      const e = mongooseErrorHandler(err);
      expect(e.message).toBe('age must be a number');
      expect(e.path).toBe('age');
      expect(e.kind).toBe('number');
      expect(e.value).toEqual('aaaa');
    }
  });

  test('should transform validation error when set messages', async () => {
    try {
      const schema = new mongoose.Schema({
        name: {
          type: String,
        },
        age: Number,
      });
      const model = mongoose.model('person', schema);
      await model.create({ age: 'aaaa' });
    } catch (err) {
      const e = mongooseErrorHandler(err, {
        messages: { number: '{path} is not number' },
      });
      expect(e.message).toBe('age is not number');
      expect(e.path).toBe('age');
      expect(e.kind).toBe('number');
      expect(e.value).toEqual('aaaa');
    }
  });
});

describe('number.max', () => {
  test('should transform validation error', async () => {
    try {
      const schema = new mongoose.Schema({
        name: {
          type: String,
        },
        age: {
          type: Number,
          max: 60,
        },
      });
      const model = mongoose.model('person', schema);
      await model.create({ age: 100 });
    } catch (err) {
      // => person validation failed: age: Path `age` (100) is more than maximum allowed value (60).

      const e = mongooseErrorHandler(err);
      expect(e.message).toBe('age must be greater than or equal to 60');
      expect(e.path).toBe('age');
      expect(e.kind).toBe('number.max');
      expect(e.value).toEqual(100);
    }
  });

  test('should transform validation error when set messages', async () => {
    try {
      const schema = new mongoose.Schema({
        name: {
          type: String,
        },
        age: {
          type: Number,
          max: 60,
        },
      });
      const model = mongoose.model('person', schema);
      await model.create({ age: 100 });
    } catch (err) {
      // => person validation failed: age: Path `age` (100) is more than maximum allowed value (60).

      const e = mongooseErrorHandler(err, {
        messages: {
          'number.max': '@{path} must be greater than or equal to {max}',
        },
      });
      expect(e.message).toBe('@age must be greater than or equal to 60');
      expect(e.path).toBe('age');
      expect(e.kind).toBe('number.max');
      expect(e.value).toEqual(100);
    }
  });
});

describe('date', () => {
  test('should transform validation error', async () => {
    try {
      const schema = new mongoose.Schema({
        name: {
          type: String,
        },
        brithday: {
          type: Date,
        },
      });
      const model = mongoose.model('person', schema);
      await model.create({ brithday: 'x' });
    } catch (err) {
      // => person validation failed: brithday: Cast to date failed for value "x" at path "brithday"

      const e = mongooseErrorHandler(err);
      expect(e.message).toBe('brithday must be a date');
      expect(e.path).toBe('brithday');
      expect(e.kind).toBe('date');
      expect(e.value).toEqual('x');
    }
  });
});

describe('date.max', () => {
  test('should transform validation error', async () => {
    try {
      const schema = new mongoose.Schema({
        name: {
          type: String,
        },
        brithday: {
          type: Date,
          max: '1-1-2021'
        },
      });
      const model = mongoose.model('person', schema);
      await model.create({ brithday: '2-1-2021' });
    } catch (err) {
      // => person validation failed: brithday: Path `brithday` (Mon Feb 01 2021 00:00:00 GMT+0700 (Indochina Time)) is after maximum allowed value (1-1-2021).
      const e = mongooseErrorHandler(err);
      expect(e.message).toBe('brithday must be less than or equal to 1-1-2021');
      expect(e.path).toBe('brithday');
      expect(e.kind).toBe('date.max');
      expect(e.value).toEqual(new Date('2-1-2021'));
    }
  });
});

describe('date.max', () => {
  test('should transform validation error', async () => {
    try {
      const schema = new mongoose.Schema({
        name: {
          type: String,
        },
        brithday: {
          type: Date,
          min: '2-1-2021'
        },
      });
      const model = mongoose.model('person', schema);
      await model.create({ brithday: '1-1-2021' });
    } catch (err) {
      // => person validation failed: brithday: Path `brithday` (Fri Jan 01 2021 00:00:00 GMT+0700 (Indochina Time)) is before minimum allowed value (2-1-2021).
      
      const e = mongooseErrorHandler(err);
      expect(e.message).toBe('brithday must be greater than or equal to 2-1-2021');
      expect(e.path).toBe('brithday');
      expect(e.kind).toBe('date.min');
      expect(e.value).toEqual(new Date('1-1-2021'));
    }
  });
});