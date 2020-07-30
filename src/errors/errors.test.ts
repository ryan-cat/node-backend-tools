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
import { ApolloServer } from 'apollo-server';

describe('errors', () => {
  it('should be instances of ApolloError', () => {
    expect(isInstance(new UserInputError(''))).toBeTruthy();
    expect(isInstance(new AuthenticationError())).toBeTruthy();
    expect(isInstance(new ItemNotFoundError(''))).toBeTruthy();
    expect(isInstance(new ValidationError(''))).toBeTruthy();
    expect(isInstance(new AuthorizationError(''))).toBeTruthy();
    expect(isInstance(new AuthorizationActionError(''))).toBeTruthy();
    expect(isInstance(new APIError(''))).toBeTruthy();
    expect(isInstance(new InternalServerError(''))).toBeFalsy();
  });

  it('should have correct message for user input error', () => {
    const message = 'Sample message';
    expect(new UserInputError(message).message).toMatchSnapshot();
  });

  it('should have correct message for item not found error for item and action', () => {
    const item = 'user';
    const action = 'create';
    expect(new ItemNotFoundError(item, action).message).toMatchSnapshot();
  });

  it('should have correct message for item not found error for item and no action', () => {
    const item = 'user';
    expect(new ItemNotFoundError(item).message).toMatchSnapshot();
  });

  it('should have correct message and data for validation error for item and no action', () => {
    const item = 'user';
    const error = new ValidationError(item);

    expect(error.message).toMatchSnapshot();
  });

  it('should have correct message and data for validation error for item and action and data', () => {
    const item = 'user';
    const action = 'create';
    const data = {
      field: 'name'
    };
    const error = new ValidationError(item, action, data);

    expect(error.message).toMatchSnapshot();
    expect(error.data).toStrictEqual(data);
  });

  it('should have correct message for authorization error', () => {
    const message = 'Sample message';
    expect(new AuthorizationError(message).message).toMatchSnapshot();
  });

  it('should have correct message for authorization action error', () => {
    const action = 'create';
    expect(new AuthorizationActionError(action).message).toMatchSnapshot();
  });

  it('should have correct message for api error', () => {
    const message = 'Sample message';
    expect(new APIError(message).message).toMatchSnapshot();
  });
});

describe('format error', () => {
  it('should work with apollo server', () => {
    new ApolloServer({
      formatError: (err: GraphQLError) => formatError(err),
      typeDefs: `
        type Query {
          hello: String!
        }
      `,
      resolvers: {
        Query: {
          hello: () => {
            return 'world';
          }
        }
      }
    });
  });

  it('should not show original error when not type of ApolloError and masking', () => {
    const originalError = new Error('Error');

    const error = new GraphQLError('Something happened', null, null, null, null, originalError);
    const formattedError = formatError(error, true);

    expect(formattedError.message).toBe(new InternalServerError().message);
  });

  it('should show original error when type of ApolloError and masking', () => {
    const message = 'original error';
    const data = {
      field: 'name'
    };

    const originalError = new ApolloError('Error', { message, data }, { message, data });

    const error = new GraphQLError('Something happened', null, null, null, null, originalError);
    const formattedError = formatError(error, true);

    expect(formattedError.message).toBe(message);
    expect(formattedError.extensions.data).toStrictEqual(data);
  });

  it('should show original error when type of ApolloError and not masking', () => {
    const message = 'original error';
    const data = {
      field: 'name'
    };

    const originalError = new ApolloError('Error', { message, data }, { message, data });

    const error = new GraphQLError('Something happened', null, null, null, null, originalError);
    const formattedError = formatError(error, true);

    expect(formattedError.message).toBe(message);
    expect(formattedError.extensions.data).toStrictEqual(data);
  });

  it('should show original error when not type of ApolloError and not masking', () => {
    const message = 'original error';
    const originalError = new Error(message);

    const error = new GraphQLError('Something happened', null, null, null, null, originalError);
    const formattedError = formatError(error, false);

    expect(formattedError.message).toBe(message);
  });
});
