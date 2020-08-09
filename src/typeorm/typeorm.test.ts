import { column, table, removeAlias, databaseConfig, isUniqueError } from './index';
import { Column, Entity } from 'typeorm';

describe('typeorm column and table helpers', () => {
  it('should return true when checking for a unique error and there is one', () => {
    const error = 'unique constraint "username"';
    const isUnique = isUniqueError(error, 'UserName');

    expect(isUnique).toBeTruthy();
  });

  it('should return false when checking for a unique error and there is not one', () => {
    const error = '';
    const isUnique = isUniqueError(error, 'UserName');

    expect(isUnique).toBeFalsy();
  });

  it('should retrieve column name given table class and property name', () => {
    @Entity()
    class User {
      @Column({ name: 'userName' })
      username: string;
    }

    const columnName = column(User, 'username');

    expect(columnName).toBe('userName');
  });

  it('should retrieve column name given table class and property name', () => {
    @Entity()
    class User {
      @Column()
      username: string;
    }

    const columnName = column(User, 'username');

    expect(columnName).toBe('username');
  });

  it('should retrieve table name given table class when a specific table name is used', () => {
    @Entity('users')
    class User {}

    const tableName = table(User);

    expect(tableName).toBe('users');
  });

  it('should retrieve default table name given table class when a specific table name is not used', () => {
    @Entity()
    class User {}

    const tableName = table(User);

    expect(tableName).toBe('user');
  });
});

describe('typeorm general helpers', () => {
  it('should remove alias when alias is present for separator "."', () => {
    const prop = 'x.username';

    const result = removeAlias(prop);

    expect(result).toBe('username');
  });

  it('should remove alias when alias is present for separator "_"', () => {
    const prop = 'x_username';

    const result = removeAlias(prop, '_');

    expect(result).toBe('username');
  });

  it('should return string when no alias is present', () => {
    const prop = 'x.username';

    const result = removeAlias(prop, '_');

    expect(result).toBe('x.username');
  });
});

describe('typeorm database config', () => {
  const OLD_ENV = process.env;

  beforeEach(() => {
    jest.resetModules(); // most important - it clears the cache
    process.env = { ...OLD_ENV }; // make a copy
  });

  afterAll(() => {
    process.env = OLD_ENV; // restore old env
  });

  it('should have default standard config settings', () => {
    const config = databaseConfig();

    expect(config.type).toBe('postgres');
    expect(config.entities).toEqual(['src/**/*Models.js']);
    expect(config.synchronize).toBeFalsy();
    expect(config.ssl).toStrictEqual({ rejectUnauthorized: false });
    expect(config.migrations).toEqual(['src/migrations/*.ts']);
    expect(config.cli.migrationsDir).toBe('src/migrations');
  });

  it('should have default config settings set to specified values', () => {
    process.env.DATABASE_ENTITIES = 'src/**/*Models.{ts,js}';
    process.env.DATABASE_SYNCHRONIZE = 'true';
    process.env.DATABASE_SSL = 'false';

    const config = databaseConfig();

    expect(config.entities).toEqual(['src/**/*Models.{ts,js}']);
    expect(config.synchronize).toBeTruthy();
    expect(config.ssl).toBeUndefined();
  });

  it('should use database url', () => {
    process.env.DATABASE_URL = 'postgres://postgres:password@host/schema';

    const config = databaseConfig();

    expect(config.url).toBe(process.env.DATABASE_URL);
    expect(config.host).toBeUndefined();
    expect(config.database).toBeUndefined();
    expect(config.schema).toBeUndefined();
    expect(config.port).toBeUndefined();
    expect(config.username).toBeUndefined();
    expect(config.password).toBeUndefined();
  });

  it('should use database specific params', () => {
    process.env.DATABASE_HOST = 'http://localhost:5433';
    process.env.DATABASE_DATABASE = 'postgres';
    process.env.DATABASE_USERNAME = 'username';
    process.env.DATABASE_PASSWORD = 'password';
    process.env.DATABASE_SCHEMA = 'schema';
    process.env.DATABASE_PORT = '5433';

    const config = databaseConfig();

    expect(config.url).toBeUndefined();
    expect(config.host).toBe(process.env.DATABASE_HOST);
    expect(config.database).toBe(process.env.DATABASE_DATABASE);
    expect(config.schema).toBe(process.env.DATABASE_SCHEMA);
    expect(config.port).toBe(+process.env.DATABASE_PORT);
    expect(config.username).toBe(process.env.DATABASE_USERNAME);
    expect(config.password).toBe(process.env.DATABASE_PASSWORD);
  });

  it('should use default values for port when not specified', () => {
    const config = databaseConfig();

    expect(config.port).toBe(5432);
  });

  it('should use default values for port when NaN', () => {
    process.env.DATABASE_PORT = 'asdf';

    const config = databaseConfig();

    expect(config.port).toBe(5432);
  });
});
