import { Config } from "apollo-server-lambda";
import Mutation from "./mutation";
import Query from "./query";
import { Resolvers } from "./generated/graphql";
import typeDefs from "./graphql/schema.graphql";
import context from "./context";
import schemaDirectives from "./directive";

const resolvers: Resolvers = { Query, Mutation };

export default {
  typeDefs,
  resolvers,
  context,
  schemaDirectives
} as Config;
