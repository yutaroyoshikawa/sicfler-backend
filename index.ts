import { ApolloServer } from "apollo-server-lambda";
import config from "./src/main";

const server = new ApolloServer(config);

export const graphql = server.createHandler({
  cors: {
    origin: "*",
    credentials: true
  }
});
