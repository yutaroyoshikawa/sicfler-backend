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
  },
  async orner(_parent, args) {
    return {
      id: args.id,
      email: "",
      name: "",
      discription: "",
      images: []
    };
  },
  async orners() {
    return [
      {
        id: "hoge",
        email: "",
        name: "",
        discription: "",
        images: []
      }
    ];
  },
  async post(_parent, args) {
    return {
      id: args.id,
      name: "",
      start: new Date(),
      finish: new Date(),
      images: [],
      visitors: [],
      orner: {
        id: "",
        email: "",
        name: "",
        images: []
      },
      target: {
        ageGroup: 20,
        gender: 0
      }
    };
  },
  async posts() {
    return [
      {
        id: "",
        name: "",
        start: new Date(),
        finish: new Date(),
        images: [],
        visitors: [],
        orner: {
          id: "",
          email: "",
          name: "",
          images: []
        },
        target: {
          ageGroup: 20,
          gender: 0
        }
      }
    ];
  }
};

export default Query;
