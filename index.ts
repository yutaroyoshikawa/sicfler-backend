import { ApolloServer } from "apollo-server-lambda";
import { typeDefs, resolvers } from "./src/main";

const server = new ApolloServer({ typeDefs, resolvers });

export const handler = server.createHandler();
