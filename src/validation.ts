import { ValidationError } from './errors';

export interface ValidationMessageOptions {
  item: string;
  action?: string;
}

const defaultValidationOptions: ValidationMessageOptions = {
  item: 'Item',
  action: 'saved'
};

export const getValidationError = (data: any = null, validationOptions: ValidationMessageOptions = defaultValidationOptions): ValidationError => {
  return new ValidationError(validationOptions.item, validationOptions.action, data);
};

export const validate = <E>(item: E, validator: any, validationOptions: ValidationMessageOptions = null, throwError = true): ValidationError => {
  const result = validator.validate(item, {
    language: {
      key: '{{label}} '
    },
    convert: false,
    abortEarly: false,
    allowUnknown: true
  });

  if (result.error) {
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

    if (throwError) {
      throw getValidationError(data, validationOptions);
    } else {
      return getValidationError(data, validationOptions);
    }
  }
};

export const validateAndReturn = <E>(item: E, validator: any = null, validationOptions: ValidationMessageOptions = null): ValidationError => {
  return validate(item, validator, validationOptions, false);
};

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

export const customValidationMessages = (errors, map) => {
  errors.forEach((err) => {
    if (map[err.type]) {
      err.message = map[err.type];
    }
  });

  return errors;
};
