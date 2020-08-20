import { ValidationError } from '../errors';
import { Schema } from 'joi';

export interface ValidationMessageOptions {
  item: string;
  action?: string;
}

const defaultValidationOptions: ValidationMessageOptions = {
  item: 'Item',
  action: 'saved'
};

export const validate = <E>(
  item: E,
  validator: Schema,
  validationOptions: ValidationMessageOptions = defaultValidationOptions,
  throwError = true
): ValidationError => {
  if (validator == null) {
    throw new Error('Provided validator is null.');
  }

  const result = validator.validate(item, {
    errors: {
      wrap: {
        label: ''
      },
      label: 'key'
    },
    convert: false,
    abortEarly: false,
    allowUnknown: true
  });

  if (result && result.error) {
    console.log(result.error.details);
    const data = {};

    result.error.details.forEach((detail) => {
      const key = detail.context.key;
      const message = detail.message.charAt(0).toUpperCase() + detail.message.slice(1) + '.';

      if (!data[key]) {
        data[key] = [message];
      } else {
        data[key] = [...data[key], message];
      }
    });

    const options = validationOptions || defaultValidationOptions;

    if (throwError) {
      throw new ValidationError(options.item, options.action, data);
    } else {
      return new ValidationError(options.item, options.action, data);
    }
  }
};

export abstract class Validatable {
  public validator: Schema;
  public validationOptions: ValidationMessageOptions;

  public validate = <E>(item: E, throwError = true) => {
    return validate(item, this.validator, this.validationOptions, throwError);
  };
}

export const mergeValidationErrors = (err1: ValidationError, err2: ValidationError, throwError = false): ValidationError => {
  let err = err1;
  if (!err1) {
    err = err2;
  } else if (err2) {
    Object.keys(err2.data).forEach((key) => {
      if (err1.data[key] && err1.data[key].length > 0) {
        err.data[key] = [...err2.data[key], ...err1.data[key]];
      } else {
        err.data[key] = err2.data[key];
      }
    });
  }

  if (err && throwError) {
    throw err;
  } else {
    return err;
  }
};

interface ErrorItem {
  code: string;
  message: string;
}

export const customValidationMessages = (errors: ErrorItem[], map: { [key: string]: string }): any => {
  errors.forEach((err) => {
    if (map[err.code]) {
      err.message = map[err.code];
    }
  });

  return errors;
};
