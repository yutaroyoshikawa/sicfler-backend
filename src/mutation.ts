/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { ApolloError } from "apollo-server-lambda";
import { MutationResolvers, Roles } from "./generated/graphql";
import { cognitoAdmin } from "./cognito";
import DB, { Tables } from "./dynamoDB";

const UserPoolId = process.env.COGNITO_POOL_ID!;

const Mutation: MutationResolvers = {
  async addUser(_parent, args) {
    const response = await cognitoAdmin
      .adminCreateUser({
        UserPoolId,
        Username: args.email,
        TemporaryPassword: args.password,
        UserAttributes: [
          {
            Name: "role",
            Value: Roles.User
          }
        ]
      })
      .promise()
      .catch(err => {
        throw new ApolloError(err);
      });

    return {
      id: response.User?.Username!,
      creationDate: response.User?.UserCreateDate,
      lastModifiedDate: response.User?.UserLastModifiedDate
    };
  },
  async deleteUser(_parent, args) {
    await cognitoAdmin
      .adminDeleteUser({
        UserPoolId,
        Username: args.id
      })
      .promise()
      .catch(err => {
        throw new ApolloError(err);
      });

    return {
      id: args.id,
      creationDate: null,
      lastModifiedDate: null
    };
  },
  async addOrner(_parent, args) {
    await cognitoAdmin
      .adminUpdateUserAttributes({
        UserPoolId,
        Username: args.id,
        UserAttributes: [
          {
            Name: "role",
            Value: Roles.Orner
          }
        ]
      })
      .promise()
      .catch(err => {
        throw new ApolloError(err);
      });

    const orner = {
      id: args.id,
      email: args.email,
      name: args.name,
      discription: args.discription,
      icon: args.icon,
      images: args.images,
      address: args.address,
      location: {
        xIndex: args.location?.xIndex,
        yIndex: args.location?.yIndex
      }
    };

    await DB.put({
      TableName: Tables.OrnersTable,
      Item: orner
    })
      .promise()
      .catch(err => {
        throw new ApolloError(err);
      });

    return orner;
  },
  async updateOrner(_parent, args) {
    const orner = {
      id: args.id!,
      email: args.email!,
      name: args.name!,
      discription: args.discription!,
      icon: args.icon!,
      images: args.images!,
      address: args.address!,
      location: {
        xIndex: args.location?.xIndex,
        yIndex: args.location?.yIndex
      }
    };

    await DB.update({
      TableName: Tables.OrnersTable,
      Key: {
        Name: "id",
        Value: args.id
      },
      AttributeUpdates: {
        email: {
          Value: orner.email,
          Action: "PUT"
        },
        name: {
          Value: orner.name,
          Action: "PUT"
        },
        discription: {
          Value: orner.discription,
          Action: "PUT"
        },
        icon: {
          Value: orner.icon,
          Action: "PUT"
        },
        images: {
          Value: orner.icon,
          Action: "PUT"
        },
        address: {
          Value: orner.address,
          Action: "PUT"
        },
        location: {
          Value: orner.location,
          Action: "PUT"
        }
      },
      ReturnValues: "ALL_NEW"
    })
      .promise()
      .catch(err => {
        throw new ApolloError(err);
      });

    return orner;
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
