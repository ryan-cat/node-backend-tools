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
