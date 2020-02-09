import dotenv from "dotenv";
import { ApolloServer } from "apollo-server-lambda";
import config from "./src/main";

dotenv.config();

const server = new ApolloServer(config);

export const graphql = server.createHandler({
  cors: {
    origin: "*",
    credentials: true
  }
});
