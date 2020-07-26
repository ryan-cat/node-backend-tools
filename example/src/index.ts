import 'reflect-metadata';
import { ApolloServer } from 'apollo-server';
import { createConnection } from 'typeorm';
import { databaseConfig, formatError, PageInfoType, PageInfo } from 'node-api-tools';
import { buildSchema, Query, Resolver } from 'type-graphql';
import { GraphQLError } from 'graphql';

@Resolver()
class QueryType {
  @Query(() => PageInfoType)
  public hello(): PageInfo {
    return {
      hasNext: true,
      hasPrevious: false,
      startCursor: 'fdsa',
      endCursor: 'asdf'
    };
  }
}

async function main() {
  await createConnection(databaseConfig);

  const schema = await buildSchema({
    resolvers: [QueryType, PageInfoType],
    emitSchemaFile: {
      path: 'src/generated/schema.graphql'
    },
    validate: false
  });

  const options = {
    tracing: true,
    formatError: (err: GraphQLError) => formatError(err, false),
    port: process.env.PORT || 4000
  };

  const server = new ApolloServer({
    schema,
    ...options
  });

  server.listen(options, () => console.log(`Server is running on localhost:${options.port}`));
}

main().catch((err) => console.log(err));
