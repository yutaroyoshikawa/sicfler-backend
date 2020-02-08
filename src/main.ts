import { IResolvers } from "apollo-server-lambda";
import fs from "fs";
import path from "path";
import Mutations from "./mutations";
import Queries from "./queries";

const typeDefs = fs
  .readFileSync(path.join(__dirname, "./graphql/schema.graphql"))
  .toString();

const resolvers: IResolvers = { Queries, Mutations };

const context = ({ req }: any) => {
  const token = req.headers.authorization || "";
  const user = token ? "admin" : "user";

  return { user };
};

export default {
  typeDefs,
  resolvers,
  context
};
