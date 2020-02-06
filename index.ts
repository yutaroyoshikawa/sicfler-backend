import { ApolloServer } from "apollo-server-lambda";
import { typeDefs, resolvers } from "./src/main";

const server = new ApolloServer({ typeDefs, resolvers });

const handler = server.createHandler();

export default handler;
