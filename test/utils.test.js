const { transformsError } = require('../lib/utils');

describe('transformsError', () => {
  test('should return object empty', () => {
    expect(transformsError({})).toEqual({});
  });

  test('should return error object', () => {
    let error = {
      kind: 'number',
      path: 'score',
      value: 'abc',
      message: 'score must be a number',
    };
    expect(transformsError(error)).toEqual({
      kind: 'number',
      path: 'score',
      value: 'abc',
      message: 'score must be a number',
    });
  });

  test('should return data with error properties', () => {
    let error = {
      kind: 'maxlength',
      path: 'name',
      value: 'abc',
      message: 'name is invalid',
      properties: {
        validator: () => {},
        type: 'maxlength',
        path: 'name',
        value: 'abc',
        maxlength: 2,
        message: 'score is required',
      },
    };
    expect(transformsError(error)).toEqual({
      kind: 'maxlength',
      path: 'name',
      value: 'abc',
      message: 'name is invalid',
      properties: {
        maxlength: 2,
      }
    });
  });

  test('should return data with kind number max', () => {
    let error = {
      kind: 'max',
      path: 'score',
      value: 100,
      message: 'name is invalid',
      properties: {
        validator: () => {},
        type: 'max',
        path: 'score',
        value: 100,
        max: 99,
        message: 'name is invalid',
      },
    };
    expect(transformsError(error)).toEqual({
      kind: 'number.max',
      path: 'score',
      value: 100,
      message: 'name is invalid',
      properties: {
        max: 99,
      },
    });
  });

  test('should return data with kind number min', () => {
    let error = {
      kind: 'min',
      path: 'score',
      value: 100,
      message: 'name is invalid',
      properties: {
        validator: () => {},
        type: 'max',
        path: 'score',
        value: 100,
        min: 200,
        message: 'name is invalid',
      },
    };
    expect(transformsError(error)).toEqual({
      kind: 'number.min',
      path: 'score',
      value: 100,
      message: 'name is invalid',
      properties: {
        min: 200,
      },
    });
  });
});
