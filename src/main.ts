import { gql, IResolvers } from "apollo-server-lambda";

export const typeDefs = gql`
  type Query {
    hello: String
  }
`;

export const resolvers: IResolvers = {
  Query: {
    hello: () => "Hello world!"
  }
};
