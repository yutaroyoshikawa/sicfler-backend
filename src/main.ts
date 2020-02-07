import { IResolvers } from "apollo-server-lambda";
import fs from "fs";
import path from "path";
import Mutations from "./mutations";
import Queries from "./queries";

export const typeDefs = fs
  .readFileSync(path.join(__dirname, "./graphql/schema.graphql"))
  .toString();

export const resolvers: IResolvers = { Queries, Mutations };
