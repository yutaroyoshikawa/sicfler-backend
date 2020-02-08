import { MutationResolvers } from "./generated/graphql";

const Mutation: MutationResolvers = {
  async addUser(_parent, args) {
    return {
      email: args.email,
      password: "",
      permission: "user"
    };
  },
  async deleteUser(_parent, args) {
    return {
      email: args.email,
      password: "",
      permission: "user"
    };
  }
};

export default Mutation;
