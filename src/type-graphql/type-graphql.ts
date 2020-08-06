export * from 'type-graphql';
import { ClassType, ObjectType, Field, Int } from 'type-graphql';
import { PageInfo } from '../query';

@ObjectType('PageInfo')
export class PageInfoType {
  @Field({ nullable: true })
  startCursor: string;

  @Field({ nullable: true })
  endCursor: string;

  @Field()
  hasNext: boolean;

  @Field()
  hasPrevious: boolean;
}

export interface IConnection<T> {
  edges: T[];
  pageInfo: PageInfo;
  count: number;
}

export const ConnectionType = <T>(itemClass: ClassType<T>, name: string): IConnection<T> => {
  @ObjectType(name)
  class ConnectionTypeClass implements IConnection<T> {
    @Field(() => [itemClass])
    edges: T[];

    @Field(() => PageInfoType)
    pageInfo: PageInfo;

    @Field(() => Int)
    count: number;
  }
  return new ConnectionTypeClass();
};
