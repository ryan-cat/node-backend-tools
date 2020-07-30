import { SelectQueryBuilder, Brackets, OrderByCondition, WhereExpression, getMetadataArgsStorage, QueryFailedError } from 'typeorm';
import { ListQueryParams, PageInfo } from './query';
import { PostgresConnectionOptions } from 'typeorm/driver/postgres/PostgresConnectionOptions';
import { ClassType } from 'type-graphql';

export const isUniqueError = (err: QueryFailedError, key: string): boolean => {
  return err.message.toLowerCase().includes(`unique constraint "${key.toLowerCase()}`);
};

////////////////////////// TYPESAFE DATABASE FUNCTIONS //////////////////////////

export const column = <T>(model: ClassType<T>, key: keyof T): string => {
  const columns = getMetadataArgsStorage()
    .columns.filter((x) => x.target === model && (x.options.name == key || x.propertyName == key))
    .map((x) => x.options.name || x.propertyName);

  if (!columns || columns.length == 0) {
    return key.toString();
  }

  return columns[0];
};

export const table = <T>(model: ClassType<T>): string => {
  const tables = getMetadataArgsStorage().tables.filter((x) => x.target === model);

  if (!tables || tables.length == 0) {
    return model.toString().toLowerCase();
  }

  return tables[0].name;
};

//////////////////////////////////////// UTILITY FUNCTIONS ////////////////////////////////////////

export const removeAlias = (field: string, alias = '.'): string => {
  return field.substring(field.indexOf(alias) + 1);
};

export const cleanRawResults = (arr: any[], alias = '_'): any[] => {
  const cleanedResults = [];
  arr.forEach((x) => {
    const o = {};
    for (const key of Object.keys(x)) {
      o[removeAlias(key, alias)] = x[key];
    }
    cleanedResults.push(o);
  });

  return cleanedResults;
};

const getDirectionFromOrderBy = (orderBys: OrderByCondition, key: string): 'ASC' | 'DESC' => {
  let direction = orderBys[key];
  if (direction !== 'ASC' && direction !== 'DESC') {
    direction = direction.order;
  }

  return direction;
};

const flipOrderDirection = <T>(query: SelectQueryBuilder<T>): SelectQueryBuilder<T> => {
  const { orderBys } = query.expressionMap;

  const newOrderBys: OrderByCondition = {};
  Object.keys(orderBys).forEach((order) => {
    const direction = getDirectionFromOrderBy(orderBys, order);
    newOrderBys[order] = direction === 'ASC' ? 'DESC' : 'ASC';
  });

  return query.orderBy(newOrderBys);
};

//////////////////////////////////////// APPLYING CURSORS ////////////////////////////////////////

const generateCursorConditions = <T>(qb: WhereExpression, alias: string, orderBys: OrderByCondition, cursor: T) => {
  let nextQuery = '';
  let nextParams = {};

  const opMap = {
    ASC: '>',
    DESC: '<'
  };

  Object.keys(orderBys).forEach((key, index) => {
    const keyNoAlias = removeAlias(key);
    const orderDirection = getDirectionFromOrderBy(orderBys, key);

    const operand = opMap[orderDirection];

    // set of where parameters for this order by field
    // this is based off the previeous order by field
    const thisQuery = nextQuery + `${alias}.${keyNoAlias} ${operand} :${keyNoAlias}`;

    if (index == 0) {
      qb.where(thisQuery, {
        [keyNoAlias]: cursor[keyNoAlias]
      });
    } else {
      qb.orWhere(
        new Brackets((qb) =>
          qb.where(thisQuery, {
            ...nextParams,
            [keyNoAlias]: cursor[keyNoAlias]
          })
        )
      );
    }

    // include this order by field to be part of the next fields parameters
    nextQuery += `${alias}.${keyNoAlias} = :${keyNoAlias} AND `;
    nextParams = {
      ...nextParams,
      [keyNoAlias]: cursor[keyNoAlias]
    };
  });
};

const applyCursor = <T>(query: SelectQueryBuilder<T>, cursor: T): SelectQueryBuilder<T> => {
  // if cursor object in null, can't apply cursor where options
  if (!cursor) {
    return query;
  }

  const {
    alias,
    expressionMap: { orderBys }
  } = query;

  // if no order by parameters, can't apply cursors
  if (!orderBys || Object.keys(orderBys).length == 0) {
    return query;
  }

  return query.andWhere(
    new Brackets((qb) => {
      generateCursorConditions(qb, alias, orderBys, cursor);
    })
  );
};

//////////////////////////////////////// GETTING ITEMS WITH PAGE INFO ////////////////////////////////////////

export const getManyWithPageInfo = async <T>(
  query: SelectQueryBuilder<T>,
  listQueryParams: ListQueryParams,
  cursorEntity?: T
): Promise<[T[], PageInfo, number]> => {
  const originalQuery = query.clone();

  // count before anything else so other where clauses applied by cursors do not affect the count
  const count = await query.getCount();

  if (listQueryParams.pageDirection === 'backward') {
    query = flipOrderDirection(query);
  }

  // apply the cursor to get the list of items to return
  // add one to the take + skip parameter, this gives us one extra page of items than we asked for in order to determine if there is a next page easily
  let items = await applyCursor(query, cursorEntity)
    .take(listQueryParams.take + listQueryParams.skip + 1)
    .skip(listQueryParams.skip)
    .getMany();

  // if there are more item returned than the requested amount, then there is another page (why we did take + skip + 1 above)
  const tooManyItems = items.length > listQueryParams.take + listQueryParams.skip;

  if (listQueryParams.pageDirection === 'backward') {
    items = items.reverse();
  }

  // removed the extra items we asked for from the items list
  if (items.length > listQueryParams.take + listQueryParams.skip) {
    items = listQueryParams.pageDirection === 'forward' ? items.slice(0, items.length - listQueryParams.skip - 1) : items.slice(1 + listQueryParams.skip);
  }

  // next cursor is simply the last item of the result
  const nextCursor = items.length > 0 ? items[items.length - 1] : null;
  // previous cursor is simply the first item of the result
  const previousCursor = items.length > 0 ? items[0] : null;

  // all cursor paginated queries should have a unique key as the last option of the order by, get that in order to use to get the id of the next/previous cursors
  const uniqueKey = removeAlias(Object.keys(query.expressionMap.orderBys).pop());

  // determine if we have previous (when pagigng forward) or have next (when paging backwards
  const otherQuery = listQueryParams.pageDirection === 'forward' ? flipOrderDirection(originalQuery) : query;
  const otherItems = await applyCursor(otherQuery, listQueryParams.pageDirection === 'forward' ? previousCursor : nextCursor)
    .take(1)
    .skip(listQueryParams.skip)
    .getMany();

  const hasOther = otherItems.length > 0;

  const pageInfo: PageInfo = {
    startCursor: previousCursor && Buffer.from(previousCursor[uniqueKey] + '').toString('base64'),
    endCursor: nextCursor && Buffer.from(nextCursor[uniqueKey] + '').toString('base64'),
    hasNext: listQueryParams.pageDirection === 'forward' ? tooManyItems : previousCursor ? hasOther : false,
    hasPrevious: listQueryParams.pageDirection === 'backward' ? tooManyItems : nextCursor ? hasOther : false
  };

  return [items, pageInfo, count];
};

/////////////////////////////// DATABASE CONFIG ///////////////////////////////

let databaseConfig: PostgresConnectionOptions = {
  type: 'postgres',
  entities: [process.env.DATABASE_ENTITIES || 'src/**/*Models.{ts,js}'],
  synchronize: process.env.DATABASE_SYNCHRONIZE !== undefined ? process.env.DATABASE_SYNCHRONIZE === 'true' : false,
  ssl:
    process.env.DATABASE_SSL === 'true' || process.env.DATABASE_SSL === undefined
      ? {
          rejectUnauthorized: false
        }
      : undefined,
  migrations: ['src/migrations/*.ts'],
  cli: {
    migrationsDir: 'src/migrations'
  }
};

if (process.env.DATABASE_URL) {
  databaseConfig = {
    ...databaseConfig,
    url: process.env.DATABASE_URL
  };
} else {
  databaseConfig = {
    ...databaseConfig,
    host: process.env.DATABASE_HOST,
    username: process.env.DATABASE_USERNAME,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE_DATABASE,
    schema: process.env.DATABASE_SCHEMA || undefined,
    port: +process.env.DATABASE_PORT || 5432
  };
}

export { databaseConfig };
