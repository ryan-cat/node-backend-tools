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
    const data = result.error.details.map((detail) => {
      const message = detail.message.charAt(0).toUpperCase() + detail.message.slice(1) + '.';
      return { field: detail.path, error: message };
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
