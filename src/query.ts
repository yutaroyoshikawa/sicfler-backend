import { QueryResolvers } from "./generated/graphql";

const Query: QueryResolvers = {
  async user(_parent, args) {
    return {
      email: args.email,
      password: "hoge",
      permission: "hoge"
    };
  },
  async users() {
    return [
      {
        email: "hoge@hoge.com",
        password: "hoge",
        permission: "hoge"
      }
    ];
  }
};

export default Query;
