import { APIError } from './errors';

export interface ListQueryParams {
  take: number;
  skip: number;
  pageDirection: 'forward' | 'backward';
  cursor?: string;
  decodedCursor?: string;
  search: string;
}

export interface ListOptions {
  first?: number;
  skip?: number;
  search?: string;
  after?: string;
  before?: string;
  last?: number;
}

export interface PageInfo {
  hasNext: boolean;
  hasPrevious: boolean;
  startCursor: string;
  endCursor: string;
}

////////////////////////// LIST PARSING FUNCTIONS //////////////////////////

export const getListQueryParams = (listOptions: ListOptions): ListQueryParams => {
  const limitMax = 1000;

  if (!listOptions) {
    return {
      take: limitMax,
      skip: 0,
      pageDirection: 'forward',
      search: ''
    };
  }

  const forwardPaging = !!listOptions.first || !!listOptions.after;
  const backwardPaging = !!listOptions.last || !!listOptions.before;
  validatePageParams(listOptions, forwardPaging, backwardPaging);

  let take = forwardPaging ? listOptions.first : listOptions.last;
  take = !take || take > limitMax || take < 0 ? limitMax : take;
  const skip = listOptions.skip ? Math.max(listOptions.skip, 0) : 0;

  const cursor = forwardPaging ? listOptions.after : listOptions.before;

  return {
    take,
    skip,
    pageDirection: backwardPaging ? 'backward' : 'forward',
    cursor,
    decodedCursor: cursor && Buffer.from(cursor, 'base64').toString(),
    search: listOptions.search || ''
  };
};

const validatePageParams = (listOptions: ListOptions, forwardPaging: boolean, backwardPaging: boolean) => {
  if (forwardPaging && backwardPaging) {
    throw new APIError('Cannot page forward and backwards at the same time.');
  } else if (listOptions.last && !listOptions.before) {
    throw new APIError('When paging backwards, a before cursor is required.');
  }
};
