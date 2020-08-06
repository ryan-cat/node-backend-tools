import 'reflect-metadata';
import { PageInfoType } from './index';
import { Field, getMetadataStorage, ObjectType } from 'type-graphql';
import { ConnectionType } from './type-graphql';

describe('type graphql', () => {
  afterEach(() => {
    const metadata = getMetadataStorage();
    metadata.objectTypes = [];
    metadata.fields = [];
  });

  it('should have page info with correct properties', () => {
    new PageInfoType();

    const metadata = getMetadataStorage();

    expect(metadata.objectTypes).toHaveLength(1);
    expect(metadata.objectTypes[0].name).toBe('PageInfo');

    expect(metadata.fields).toHaveLength(4);

    const fieldNames = metadata.fields.map((x) => x.name);

    expect(fieldNames).toContain('startCursor');
    expect(fieldNames).toContain('endCursor');
    expect(fieldNames).toContain('hasNext');
    expect(fieldNames).toContain('hasPrevious');
  });

  it('should create class with correct name and type', () => {
    @ObjectType('User')
    class UserType {
      @Field()
      id: number;
    }

    ConnectionType(UserType, 'User');
    const metadata = getMetadataStorage();

    const fieldNames = metadata.fields.map((x) => x.name);

    expect(fieldNames).toContain('count');
    expect(fieldNames).toContain('edges');
    expect(fieldNames).toContain('pageInfo');
    expect(metadata.objectTypes.map((x) => x.name)).toContain('UserConnection');
  });
});
