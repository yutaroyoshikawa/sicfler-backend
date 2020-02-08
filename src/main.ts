import { Config } from "apollo-server-lambda";
import Mutation from "./mutations";
import Query from "./queries";
import { Resolvers } from "./generated/graphql";
import typeDefs from "./graphql/schema.graphql";

const resolvers: Resolvers = { Query, Mutation };

const context = () => {
  // const token = req.headers.authorization || "";
  // const user = token ? "admin" : "user";

  return { user: "user" };
};

export default {
  typeDefs,
  resolvers,
  context
} as Config;
