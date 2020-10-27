import { ValidationError } from './../errors/errors';
import { validate, Validatable, customValidationMessages, ValidationMessageOptions } from './index';
import * as validation from './validation';
import * as joi from 'joi';

describe('validate', () => {
  const options: ValidationMessageOptions = {
    item: 'User',
    action: 'created'
  };

  const schema: joi.Schema = joi.object();

  const validationResult: joi.ValidationResult = {
    value: null,
    error: {
      name: 'ValidationError',
      annotate: null,
      message: '',
      isJoi: true,
      _object: null,
      details: [
        {
          path: ['email'],
          type: '',
          context: {
            key: 'email'
          },
          message: 'Invalid email'
        },
        {
          path: ['email'],
          type: '',
          context: {
            key: 'email'
          },
          message: 'Email too long'
        },
        {
          path: ['username'],
          type: '',
          context: {
            key: 'username'
          },
          message: 'Username too long'
        },
        {
          path: ['posts', 0, 'title'],
          type: '',
          context: {
            key: 'title'
          },
          message: 'Title too long'
        }
      ]
    }
  };

  const expectedErrorData = [
    { field: validationResult.error.details[0].path, error: validationResult.error.details[0].message + '.'},
    { field: validationResult.error.details[1].path, error: validationResult.error.details[1].message + '.'},
    { field: validationResult.error.details[2].path, error: validationResult.error.details[2].message + '.'},
    { field: validationResult.error.details[3].path, error: validationResult.error.details[3].message + '.'},
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should throw error if validator is null', () => {
    try {
      validate({}, null);
    } catch (err) {
      return;
    }

    fail(new Error('Expected error to be throw because validator is null.'));
  });

  it('should validate and return null for no issues', () => {
    jest.spyOn(schema, 'validate').mockImplementationOnce(() => null);

    const result = validate({}, schema);
    expect(result).toBeUndefined();
  });

  it('should validate and throw error due to validation issues', () => {
    jest.spyOn(schema, 'validate').mockImplementationOnce(() => validationResult);

    try {
      validate({}, schema);
    } catch (err) {
      const error = err as ValidationError;
      expect(error.message).toMatchSnapshot();
      expect(error.data).toStrictEqual(expectedErrorData);

      return;
    }

    fail(new Error('Expected validation error to be thrown.'));
  });

  it('should validate and throw error due to validation issues with custom message options', () => {
    jest.spyOn(schema, 'validate').mockImplementationOnce(() => validationResult);

    try {
      validate({}, schema, options);
    } catch (err) {
      const error = err as ValidationError;
      expect(error.message).toMatchSnapshot();
      expect(error.data).toStrictEqual(expectedErrorData);

      return;
    }

    fail(new Error('Expected validation error to be thrown.'));
  });

  it('should validate and return error due to validation issues', () => {
    jest.spyOn(schema, 'validate').mockImplementationOnce(() => validationResult);

    const error = validate({}, schema, null, false);
    expect(error.message).toMatchSnapshot();
    expect(error.data).toStrictEqual(expectedErrorData);
  });

  it('should call validate for validatable class', () => {
    class User extends Validatable {
      validator = schema;
    }

    const spy = jest.spyOn(validation, 'validate');

    const u = new User();
    u.validate({});

    expect(spy).toBeCalledTimes(1);
    expect(spy).toBeCalledWith({}, schema, undefined, true);
  });
});

describe('custom validation errors', () => {
  it('should replace default error message with custom error message', () => {
    const errors = [
      { code: 'maxlength', message: 'The length of the item is too long.', path: [] },
      { code: 'minlength', message: 'The length of the item is too short.', path: [] }
    ];

    const map = {
      minlength: "The item's lenghth is not long enough."
    };

    const result = customValidationMessages(errors, map);

    expect(result).toHaveLength(2);
    expect(result[0].message).toBe(errors[0].message);
    expect(result[1].message).toBe(map.minlength);
  });
});
