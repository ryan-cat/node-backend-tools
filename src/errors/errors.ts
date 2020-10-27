import { ApolloError, formatError as formatApolloError, isInstance as isApolloErrorInstance } from 'apollo-errors';
import { GraphQLError, GraphQLFormattedError } from 'graphql';

class BaseError extends ApolloError {
  public data: any;
}

export class AuthenticationError extends BaseError {
  private static DEFAULT_MESSAGE = 'You must be authenticated to access this data.';

  constructor() {
    const defaultConfig = { message: AuthenticationError.DEFAULT_MESSAGE };

    super('AuthenticationError', defaultConfig, defaultConfig);
  }
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

  constructor(message: string = UserInputError.DEFAULT_MESSAGE) {
    const defaultConfig = { message: UserInputError.DEFAULT_MESSAGE };

    super('UserInputError', defaultConfig, defaultConfig);

    this.message = message;
  }
}

export interface ValidationErrorItem {
  field: (string | number)[];
  error: string;
}

export class ValidationError extends BaseError {
  private static DEFAULT_MESSAGE = 'The item could not be saved due to issues with the provided input.';

  constructor(item: string, action = 'saved', data: ValidationErrorItem[] = null) {
    const defaultConfig = { message: ValidationError.DEFAULT_MESSAGE };

    super('ValidationError', defaultConfig, defaultConfig);

    this.message = `${item} could not be ${action} due to issues with the provided input.`;
    this.data = data;
  }
}

export class AuthorizationError extends BaseError {
  private static DEFAULT_MESSAGE = 'You do not have permission to perform this task.';

  constructor(message: string = AuthorizationError.DEFAULT_MESSAGE) {
    const defaultConfig = { message: AuthorizationError.DEFAULT_MESSAGE };

    super('AuthorizationError', defaultConfig, defaultConfig);

    this.message = message;
  }
}

export class AuthorizationActionError extends BaseError {
  private static DEFAULT_MESSAGE = 'You do not have permission to perform this task.';

  constructor(action: string = AuthorizationActionError.DEFAULT_MESSAGE) {
    const defaultConfig = { message: AuthorizationActionError.DEFAULT_MESSAGE };

    super('AuthorizationError', defaultConfig, defaultConfig);

    this.message = `You do not have permission to ${action}.`;
  }
}

export class InternalServerError extends BaseError {
  private static DEFAULT_MESSAGE = 'Oops! Something went wrong. Please try again.';

  constructor(message: string = InternalServerError.DEFAULT_MESSAGE) {
    const defaultConfig = { message: InternalServerError.DEFAULT_MESSAGE };
    super('InternalServerError', defaultConfig, defaultConfig);

    this.message = message;
  }
}

export class APIError extends BaseError {
  private static DEFAULT_MESSAGE = 'The parameter configuration provided is invalid.';

  constructor(message: string = APIError.DEFAULT_MESSAGE) {
    const defaultConfig = { message: APIError.DEFAULT_MESSAGE };
    super('APIError', defaultConfig, defaultConfig);

    this.message = message;
  }
}

export const formatError = (error: GraphQLError, mask: boolean = true): GraphQLFormattedError<Record<string, any>> => {
  const err = error?.originalError;

  let newError = formatApolloError(new InternalServerError());
  if (isApolloErrorInstance(err)) {
    newError = formatApolloError(err);
  } else if (err && !isApolloErrorInstance(error) && !mask) {
    newError = formatApolloError(new InternalServerError(err.message));
  }

  return {
    message: newError.message,
    locations: newError.locations,
    extensions: {
      code: newError.name,
      data: newError.data,
      timeThrown: newError.time_thrown
    }
  } as GraphQLFormattedError<Record<string, any>>;
};
