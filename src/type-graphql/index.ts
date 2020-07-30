import { ClassType, ObjectType, Field, Int } from 'type-graphql';

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

// export const ConnectionType = <T>(itemClass: ClassType<T>, name: string) => {
//   @ObjectType(name)
//   class ConnectionTypeClass {
//     @Field(() => [itemClass])
//     edges: T[];

//     @Field(() => PageInfoType)
//     pageInfo: PageInfo;

//     @Field(() => Int)
//     count: number;
//   }
//   return ConnectionTypeClass;
// };
