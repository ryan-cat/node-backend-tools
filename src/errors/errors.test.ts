import { ApolloError, isInstance } from 'apollo-errors';
import { GraphQLError } from 'graphql';
import {
  formatError,
  UserInputError,
  ValidationError,
  InternalServerError,
  ItemNotFoundError,
  AuthenticationError,
  AuthorizationError,
  AuthorizationActionError,
  APIError
} from './index';

describe('errors', () => {
  it('should be instances of ApolloError', () => {
    expect(isInstance(new UserInputError(''))).toBeTruthy();
    expect(isInstance(new AuthenticationError())).toBeTruthy();
    expect(isInstance(new ItemNotFoundError(''))).toBeTruthy();
    expect(isInstance(new ValidationError(''))).toBeTruthy();
    expect(isInstance(new AuthorizationError(''))).toBeTruthy();
    expect(isInstance(new AuthorizationActionError(''))).toBeTruthy();
    expect(isInstance(new APIError(''))).toBeTruthy();
    expect(isInstance(new InternalServerError(''))).toBeTruthy();
  });

  it('should show original error', () => {});

  it('should show raw error when not masking', () => {
    const message = 'original error';
    const data = {
      field: 'name'
    };

    const originalError = new ApolloError('Error', { message, data }, { message, data });

    const error = new GraphQLError('Something happened', null, null, null, null, originalError);
    const formattedError = formatError(error, false);

    expect(formattedError.message).toBe(message);
    expect(formattedError.extensions.data).toStrictEqual(data);
  });

  it('should not show raw error when masking', () => {
    const message = 'original error';

    const originalError = new ApolloError('Error', { message }, { message });

    const error = new GraphQLError('Something happened', null, null, null, null, originalError);
    const formattedError = formatError(error, true);

    expect(formattedError.message).toBe(new InternalServerError().message);
  });
});
