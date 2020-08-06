import { ValidationError } from './../errors/errors';
import { validate, mergeValidationErrors, Validatable, customValidationMessages, ValidationMessageOptions } from './index';
import * as validation from './validation';
import * as joi from 'joi';

describe('validate', () => {
  const options: ValidationMessageOptions = {
    item: 'User',
    action: 'created'
  };

  const schema: joi.Schema = joi.object();

  const validationResult = {
    error: {
      details: [
        {
          context: {
            key: 'email'
          },
          message: 'Invalid email'
        },
        {
          context: {
            key: 'email'
          },
          message: 'Email too long'
        },
        {
          context: {
            key: 'username'
          },
          message: 'Username too long'
        }
      ]
    }
  };

  const expectedErrorData = {
    email: [validationResult.error.details[0].message + '.', validationResult.error.details[1].message + '.'],
    username: [validationResult.error.details[2].message + '.']
  };

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
    jest.spyOn(schema, 'validate').mockImplementationOnce(() => {});

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

describe('merge validation errors', () => {
  let error1;
  let error2;
  let mergedErrorData;

  beforeEach(() => {
    error1 = new ValidationError('User', null, {
      email: ['test', 'sample'],
      username: ['max', 'format']
    });

    error2 = new ValidationError('User', null, {
      email: ['go', 'sample'],
      name: ['try']
    });

    mergedErrorData = {
      email: ['go', 'sample', 'test', 'sample'],
      username: ['max', 'format'],
      name: ['try']
    };
  });

  it('should return first error when second error is null', () => {
    const result = mergeValidationErrors(error1, null);
    expect(result).toStrictEqual(error1);
  });

  it('should return second error when first error is null', () => {
    const result = mergeValidationErrors(null, error1);
    expect(result).toStrictEqual(error1);
  });

  it('should merge and throw validation errors', () => {
    try {
      mergeValidationErrors(error1, error2, true);
    } catch (err) {
      const error = err as ValidationError;
      expect(error.message).toBe(error1.message);
      expect(error.data).toStrictEqual(mergedErrorData);

      return;
    }

    fail(new Error('Expected validation error to be thrown.'));
  });

  it('should merge and return validation errors', () => {
    const result = mergeValidationErrors(error1, error2);
    expect(result.message).toBe(error1.message);
    expect(result.data).toStrictEqual(mergedErrorData);
  });
});

describe('custom validation errors', () => {
  it('should replace default error message with custom error message', () => {
    const errors: joi.ValidationErrorItem[] = [
      { type: 'maxlength', message: 'The length of the item is too long.', path: [] },
      { type: 'minlength', message: 'The length of the item is too short.', path: [] }
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
