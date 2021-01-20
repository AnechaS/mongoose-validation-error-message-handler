/* eslint-disable no-undef */
const mongoose = require('mongoose');
const format = require('string-template');
const mongooseErrorHandler = require('../lib');
const messages = require('../lib/messages');

mongoose.Promise = Promise;
afterEach(function () {
  mongoose.deleteModel(/.+/);
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
      required: [true, 'name is required'],
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
      if (!Object.keys(item[0]).length) {
        await person.create(item[0]);
      } else {
        await animal.create(item[1]);
      }
      fail();
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
        expect(e.message).toBe('name is required');
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
      required: [true, 'name is required'],
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
      if (Object.keys(item[0]).length && typeof item[0].name !== 'string') {
        await person.create(item[0]);
      }

      if (!Object.keys(item[1]).length) {
        await animal.create(item[1]);
      }
      fail();
    } catch (err) {
      const options = {
        paths: {
          name: { original: true, kind: 'required' },
        },
      };

      const e = mongooseErrorHandler(err, options);
      expect(e.path).toBe('name');
      if (Object.keys(item[0]).length && typeof item[0].name !== 'string') {
        expect(e.message).toBe(format(messages.string, { path: 'name' }));
        expect(e.kind).toBe('string');
        expect(e.value).toEqual(item[0].name);
      }

      if (!Object.keys(item[1]).length) {
        expect(e.message).toBe('name is required');
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
      if (Object.keys(item[0]).length && typeof item[0].name !== 'string') {
        await person.create(item[0]);
      }
      if (!Object.keys(item[1]).length) {
        await animal.create(item[1]);
      }
      fail();
    } catch (err) {
      const options = {
        paths: {
          name: { message: 'name is invalid' },
        },
      };

      const e = mongooseErrorHandler(err, options);
      expect(e.path).toBe('name');
      expect(e.message).toBe('name is invalid');
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
      if (Object.keys(item[0]).length && typeof item[0].name !== 'string') {
        await person.create(item[0]);
      }
      if (!Object.keys(item[1]).length) {
        await animal.create(item[1]);
      }
      fail();
    } catch (err) {
      const options = {
        paths: {
          name: { message: 'name is invalid', kind: 'string' },
        },
      };

      const e = mongooseErrorHandler(err, options);
      expect(e.path).toBe('name');
      if (Object.keys(item[0]).length && typeof item[0].name !== 'string') {
        expect(e.message).toBe('name is invalid');
        expect(e.kind).toBe('string');
        expect(e.value).toEqual({});
      }
      if (!Object.keys(item[1]).length) {
        expect(e.message).toBe(format(messages.required, { path: 'name' }));
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
      fail();
    } catch (err) {
      // => person validation failed: name: Path `name` is required.

      const e = mongooseErrorHandler(err);
      expect(e.message).toBe(format(messages.required, { path: 'name' }));
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
      fail();
    } catch (err) {
      // person validation failed: name: Path `name` is required.

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
      fail();
    } catch (err) {
      // => person validation failed: name: `c` is not a valid enum value for path `name`.

      const e = mongooseErrorHandler(err);
      expect(e.message).toBe(format(messages.enum, { path: 'name' }));
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
      fail();
    } catch (err) {
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

describe('validate', () => {
  test('should transform validation error', async () => {
    try {
      const schema = new mongoose.Schema({
        name: {
          type: String,
          validate: (v) => v !== 'sa',
        },
      });
      const model = mongoose.model('person', schema);
      await model.create({ name: 'sa' });
      fail();
    } catch (err) {
      // => person validation failed: name: Validator failed for path `name` with value `sa`

      const e = mongooseErrorHandler(err);
      expect(e.message).toBe(format(messages.validate, { path: 'name' }));
      expect(e.path).toBe('name');
      expect(e.kind).toBe('validate');
      expect(e.value).toEqual('sa');
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
      fail();
    } catch (err) {
      // person validation failed: name: Cast to string failed for value "{}" at path "name"

      const e = mongooseErrorHandler(err);
      expect(e.message).toBe(format(messages.string, { path: 'name' }));
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
      fail();
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
      fail();
    } catch (err) {
      // => person validation failed: name:  Path `name` (`aaaaa`) is longer than the maximum allowed length (5).

      const e = mongooseErrorHandler(err);
      expect(e.message).toBe(format(messages.maxlength, { path: 'name', maxlength: 5 }));
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
      fail();
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
      fail();
    } catch (err) {
      // => person validation failed: name: Path `name` (`aaaa`) is shorter than the minimum allowed length (5).

      const e = mongooseErrorHandler(err);
      expect(e.message).toBe(format(messages.minlength, { path: 'name', minlength: 5 }));
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
          minlength: 5,
        },
      });
      const model = mongoose.model('person', schema);
      await model.create({ name: 'aaaa' });
      fail();
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
      fail();
    } catch (err) {
      // => person validation failed: name: Path `name` is invalid (aaaa).

      const e = mongooseErrorHandler(err);
      expect(e.message).toBe(format(messages.regexp, { path: 'name' }));
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
      fail();
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
      fail();
    } catch (err) {
      // => person validation failed: age: Cast to Number failed for value "aaaa" at path "age"

      const e = mongooseErrorHandler(err);
      expect(e.message).toBe(format(messages.number, { path: 'age' }));
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
      fail();
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
      fail();
    } catch (err) {
      // => person validation failed: age: Path `age` (100) is more than maximum allowed value (60).

      const e = mongooseErrorHandler(err);
      expect(e.message).toBe(format(messages['number.max'], { path: 'age', max: 60 }));
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
      fail();
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

describe('number.min', () => {
  test('should transform validation error', async () => {
    try {
      const schema = new mongoose.Schema({
        name: {
          type: String,
        },
        age: {
          type: Number,
          min: 18,
        },
      });
      const model = mongoose.model('person', schema);
      await model.create({ age: 16 });
      fail();
    } catch (err) {
      // => person validation failed: age: Path `age` (16) is less than minimum allowed value (18).

      const e = mongooseErrorHandler(err);
      expect(e.message).toBe(format(messages['number.min'], { path: 'age', min: 18 }));
      expect(e.path).toBe('age');
      expect(e.kind).toBe('number.min');
      expect(e.value).toEqual(16);
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
      fail();
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
      fail();
    } catch (err) {
      // => person validation failed: brithday: Cast to date failed for value "x" at path "brithday"

      const e = mongooseErrorHandler(err);
      expect(e.message).toBe(format(messages.date, { path: 'brithday' }));
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
          max: '1-1-2021',
        },
      });
      const model = mongoose.model('person', schema);
      await model.create({ brithday: '2-1-2021' });
      fail();
    } catch (err) {
      // => person validation failed: brithday: Path `brithday` (Mon Feb 01 2021 00:00:00 GMT+0700 (Indochina Time)) is after maximum allowed value (1-1-2021).

      const e = mongooseErrorHandler(err);
      expect(e.message).toBe(format(messages['date.max'], { path: 'brithday', max: '1-1-2021' }));
      expect(e.path).toBe('brithday');
      expect(e.kind).toBe('date.max');
      expect(e.value).toEqual(new Date('2-1-2021'));
    }
  });
});

describe('date.min', () => {
  test('should transform validation error', async () => {
    try {
      const schema = new mongoose.Schema({
        name: {
          type: String,
        },
        brithday: {
          type: Date,
          min: '2-1-2021',
        },
      });
      const model = mongoose.model('person', schema);
      await model.create({ brithday: '1-1-2021' });
      fail();
    } catch (err) {
      // => person validation failed: brithday: Path `brithday` (Fri Jan 01 2021 00:00:00 GMT+0700 (Indochina Time)) is before minimum allowed value (2-1-2021).

      const e = mongooseErrorHandler(err);
      expect(e.message).toBe(format(messages['date.min'], { path: 'brithday', min: '2-1-2021' }));
      expect(e.path).toBe('brithday');
      expect(e.kind).toBe('date.min');
      expect(e.value).toEqual(new Date('1-1-2021'));
    }
  });
});

describe('buffer', () => {
  test('should transform validation error', async () => {
    try {
      const schema = new mongoose.Schema({
        name: {
          type: Buffer,
        },
      });
      const model = mongoose.model('person', schema);
      await model.create({ name: {} });
      fail();
    } catch (err) {
      // => person validation failed: name: Cast to Buffer failed for value "{}" at path "name"

      const e = mongooseErrorHandler(err);
      expect(e.message).toBe(format(messages.buffer, { path: 'name' }));
      expect(e.path).toBe('name');
      expect(e.kind).toBe('buffer');
      expect(e.value).toEqual({});
    }
  });
});

describe('boolean', () => {
  test('should transform validation error', async () => {
    try {
      const schema = new mongoose.Schema({
        name: {
          type: Boolean,
        },
      });
      const model = mongoose.model('person', schema);
      await model.create({ name: '' });
      fail();
    } catch (err) {
      // => person validation failed: name: Cast to Boolean failed for value "" at path "name"

      const e = mongooseErrorHandler(err);
      expect(e.message).toBe(format(messages.boolean, { path: 'name' }));
      expect(e.path).toBe('name');
      expect(e.kind).toBe('boolean');
      expect(e.value).toEqual('');
    }
  });
});

describe('objectId', () => {
  test('should transform validation error', async () => {
    try {
      const schema = new mongoose.Schema({
        user: {
          type: mongoose.Schema.Types.ObjectId,
        },
      });
      const model = mongoose.model('person', schema);
      await model.create({ user: 'dsf' });
      fail();
    } catch (err) {
      // => person validation failed: user: Cast to ObjectId failed for value "" at path "user"

      const e = mongooseErrorHandler(err);
      expect(e.message).toBe(format(messages.objectId, { path: 'user' }));
      expect(e.path).toBe('user');
      expect(e.kind).toBe('objectId');
      expect(e.value).toEqual('dsf');
    }
  });
});

describe('map', () => {
  test('should transform validation error', async () => {
    try {
      const schema = new mongoose.Schema({
        name: {
          type: Map,
        },
      });
      const model = mongoose.model('person', schema);
      await model.create({ name: 'dsf' });
      fail();
    } catch (err) {
      // => person validation failed: name: Cast to Map failed for value "dsf" at path "name"

      const e = mongooseErrorHandler(err);
      expect(e.message).toBe(format(messages.map, { path: 'name' }));
      expect(e.path).toBe('name');
      expect(e.kind).toBe('map');
      expect(e.value).toEqual('dsf');
    }
  });
});

describe('unique', () => {
  test('should transform validation error', async () => {
    const e = mongooseErrorHandler({
      message: 'Validation failed',
      name: 'ValidationError',
      errors: {
        username: {
          message: 'Error, expected `name` to be unique. Value: `JohnSmith`',
          name: 'ValidatorError',
          kind: 'unique',
          path: 'name',
          value: 'JohnSmith',
        },
      },
    });
    expect(e.message).toBe(format(messages.unique, { path: 'name' }));
    expect(e.path).toBe('name');
    expect(e.kind).toBe('unique');
    expect(e.value).toEqual('JohnSmith');
  });
});
