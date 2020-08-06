import { APIError } from '../errors';

export interface ListQueryParams {
  take: number;
  skip: number;
  pageDirection: 'forward' | 'backward';
  cursor?: string;
  decodedCursor?: string;
  search: string;
}

export interface ListOptions {
  take?: number;
  skip?: number;
  search?: string;
  after?: string;
  before?: string;
}

export interface PageInfo {
  hasNext: boolean;
  hasPrevious: boolean;
  startCursor: string;
  endCursor: string;
}

export const maxTake = 1000;

////////////////////////// LIST PARSING FUNCTIONS //////////////////////////

export const getListQueryParams = (listOptions: ListOptions): ListQueryParams => {
  if (!listOptions) {
    return {
      take: maxTake,
      skip: 0,
      pageDirection: 'forward',
      search: ''
    };
  }

  if (!!listOptions.after && !!listOptions.before) {
    throw new APIError('Cannot page forward and backwards at the same time.');
  }

  const backwardPaging = !!listOptions.before;

  const take = !listOptions.take || listOptions.take > maxTake || listOptions.take < 0 ? maxTake : listOptions.take;
  const skip = listOptions.skip ? Math.max(listOptions.skip, 0) : 0;

  const cursor = listOptions.before || listOptions.after;

  return {
    take,
    skip,
    pageDirection: backwardPaging ? 'backward' : 'forward',
    cursor,
    decodedCursor: cursor && Buffer.from(cursor, 'base64').toString(),
    search: listOptions.search || ''
  };
};
