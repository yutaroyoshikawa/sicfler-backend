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
  },
  async addOrner(_parent, args) {
    return {
      id: "",
      email: args.email,
      name: args.name,
      discription: args.discription,
      icon: args.icon,
      images: [],
      address: args.address,
      location: {
        xIndex: args.location?.xIndex,
        yIndex: args.location?.yIndex
      }
    };
  },
  async updateOrner(_parent, args) {
    return {
      id: "",
      email: args.email ? args.email : "",
      name: args.name ? args.name : "",
      discription: args.discription,
      icon: args.icon,
      images: args.images ? args.images : [],
      address: args.address,
      location: {
        xIndex: args.location?.xIndex,
        yIndex: args.location?.yIndex
      }
    };
  },
  async addPost(_parent, args) {
    return {
      id: "",
      name: args.name,
      start: args.start,
      finish: args.finish,
      discription: args.discription,
      sumbnail: args.discription,
      images: [],
      visitors: [],
      orner: {
        id: args.ornerId,
        email: "",
        name: "",
        discription: "",
        icon: "",
        images: [],
        address: "",
        location: {
          xIndex: 0,
          yIndex: 0
        }
      },
      address: args.address,
      location: {
        xIndex: args.location?.xIndex,
        yIndex: args.location?.yIndex
      },
      target: {
        ageGroup: 10,
        gender: 1
      }
    };
  },
  async deletePost(_parent, args) {
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
  }
};

export default Mutation;
