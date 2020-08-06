import { APIError } from './../errors/errors';
import { getListQueryParams, maxTake } from './index';

describe('get list query params', () => {
  it('should return default params for no provided options', () => {
    const result = getListQueryParams(null);

    expect(result.cursor).toBe(undefined);
    expect(result.decodedCursor).toBe(undefined);
    expect(result.search).toBe('');
    expect(result.skip).toBe(0);
    expect(result.take).toBe(maxTake);
    expect(result.pageDirection).toBe('forward');
  });

  it('should return correct params for limit offset', () => {
    const result = getListQueryParams({
      take: 10,
      skip: 5
    });

    expect(result.cursor).toBe(undefined);
    expect(result.decodedCursor).toBe(undefined);
    expect(result.search).toBe('');
    expect(result.skip).toBe(5);
    expect(result.take).toBe(10);
    expect(result.pageDirection).toBe('forward');
  });

  it('should return correct params for search', () => {
    const result = getListQueryParams({
      search: 'text'
    });

    expect(result.cursor).toBe(undefined);
    expect(result.decodedCursor).toBe(undefined);
    expect(result.search).toBe('text');
    expect(result.skip).toBe(0);
    expect(result.take).toBe(maxTake);
    expect(result.pageDirection).toBe('forward');
  });

  it('should return correct params for cursor forward', () => {
    const result = getListQueryParams({
      take: 10,
      after: 'abcd'
    });

    expect(result.cursor).toBe('abcd');
    expect(result.decodedCursor).toBe(Buffer.from('abcd', 'base64').toString());
    expect(result.search).toBe('');
    expect(result.skip).toBe(0);
    expect(result.take).toBe(10);
    expect(result.pageDirection).toBe('forward');
  });

  it('should return correct params for cursor backward', () => {
    const result = getListQueryParams({
      take: 10,
      before: 'abcd'
    });

    expect(result.cursor).toBe('abcd');
    expect(result.decodedCursor).toBe(Buffer.from('abcd', 'base64').toString());
    expect(result.search).toBe('');
    expect(result.skip).toBe(0);
    expect(result.take).toBe(10);
    expect(result.pageDirection).toBe('backward');
  });

  it('should throw error when mixing forward and backwards pagination rules', () => {
    try {
      getListQueryParams({
        take: 10,
        before: 'abcd',
        after: 'efgh'
      });
    } catch (err) {
      expect(typeof err).toBe(typeof new APIError());
      return;
    }

    fail(new Error('Expected error to be thrown when trying to page forward and backwards at the same time.'));
  });
});
