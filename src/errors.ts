import { createError, ApolloError } from 'apollo-errors';
import { ErrorInfo, formatError as formatApolloError, isInstance as isApolloErrorInstance } from 'apollo-errors';
import { GraphQLError } from 'graphql';

export const AuthenticationError = createError('AuthenticationError', {
  message: 'You must be authenticated to access this data.'
});

class BaseError extends ApolloError {
  public data: { [key: string]: string[] };
}

export class ItemNotFoundError extends BaseError {
  private static DEFAULT_MESSAGE = 'The item could not be found.';

  constructor(item: string, action: string = null) {
    const defaultConfig = { message: ItemNotFoundError.DEFAULT_MESSAGE };

    super('UserInputError', defaultConfig, defaultConfig);

    const ending = action ? ` to ${action}.` : '.';
    this.message = `The ${item} could not be found${ending}`;
  }
}

export class UserInputError extends BaseError {
  private static DEFAULT_MESSAGE = 'The provided input is invalid.';

  constructor(message: string) {
    const defaultConfig = { message: UserInputError.DEFAULT_MESSAGE };

    super('UserInputError', defaultConfig, defaultConfig);

    this.message = message;
  }
}

export class ValidationError extends BaseError {
  private static DEFAULT_MESSAGE = 'The item could not be saved due to issues with the provided input.';

  constructor(item: string, action = 'saved', data: any = {}) {
    const defaultConfig = { message: ValidationError.DEFAULT_MESSAGE };

    super('ValidationError', defaultConfig, defaultConfig);

    this.message = `${item} could not be ${action} due to issues with the provided input.`;
    this.data = data;
  }
}

export class AuthorizationError extends BaseError {
  private static DEFAULT_MESSAGE = 'You do not have permission to perform this task.';

  constructor(message: string) {
    const defaultConfig = { message: AuthorizationError.DEFAULT_MESSAGE };

    super('AuthorizationError', defaultConfig, defaultConfig);

    this.message = message;
  }
}

export class AuthorizationActionError extends BaseError {
  private static DEFAULT_MESSAGE = 'You do not have permission to perform this task.';

  constructor(action: string) {
    const defaultConfig = { message: AuthorizationActionError.DEFAULT_MESSAGE };

    super('AuthorizationError', defaultConfig, defaultConfig);

    this.message = `You do not have permission to ${action}.`;
  }
}

export class InternalServerError extends BaseError {
  private static DEFAULT_MESSAGE = 'Oops! Something went wrong. Please try again.';

  constructor(message: string = null) {
    const defaultConfig = { message: InternalServerError.DEFAULT_MESSAGE };
    super('InternalServerError', defaultConfig, defaultConfig);

    this.message = message || this.message;
  }
}

export class APIError extends BaseError {
  private static DEFAULT_MESSAGE = 'The parameter configuration provided is invalid.';

  constructor(message: string = null) {
    const defaultConfig = { message: APIError.DEFAULT_MESSAGE };
    super('APIError', defaultConfig, defaultConfig);

    this.message = message || this.message;
  }
}

export const formatError = (error: GraphQLError, mask: boolean): any => {
  const err = error.originalError;

  if (isApolloErrorInstance(err)) {
    return formatApolloError(err);
  } else if (err && !isApolloErrorInstance(error) && !mask) {
    return formatApolloError(new InternalServerError(err.message));
  } else {
    return formatApolloError(new InternalServerError());
  }
};
