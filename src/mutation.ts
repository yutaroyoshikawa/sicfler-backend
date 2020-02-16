/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { ApolloError } from "apollo-server-lambda";
import nanoid from "nanoid";
import { MutationResolvers, Roles } from "./generated/graphql";
import { cognitoAdmin, Attributes } from "./cognito";
import DB, { Tables } from "./dynamoDB";

const USER_POOL_ID = process.env.COGNITO_POOL_ID!;

const Mutation: MutationResolvers = {
  async addUser(_parent, args) {
    const response = await cognitoAdmin
      .adminCreateUser({
        UserPoolId: USER_POOL_ID,
        Username: args.email,
        TemporaryPassword: args.password,
        UserAttributes: [
          {
            Name: Attributes.Role,
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
        UserPoolId: USER_POOL_ID,
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
        UserPoolId: USER_POOL_ID,
        Username: args.id,
        UserAttributes: [
          {
            Name: Attributes.Role,
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
  async addAdmin(_parent, args) {
    await cognitoAdmin
      .adminUpdateUserAttributes({
        UserPoolId: USER_POOL_ID,
        Username: args.id,
        UserAttributes: [
          {
            Name: Attributes.Role,
            Value: Roles.Admin
          }
        ]
      })
      .promise()
      .catch(err => {
        throw new ApolloError(err);
      });

    const user = await cognitoAdmin
      .adminGetUser({
        UserPoolId: USER_POOL_ID,
        Username: args.id
      })
      .promise()
      .catch(err => {
        throw new ApolloError(err);
      });

    return {
      id: user.Username,
      creationDate: user.UserCreateDate,
      lastModifiedDate: user.UserLastModifiedDate,
      role: user.UserAttributes?.find(
        attribute => attribute.Name === Attributes.Role
      )?.Value
    };
  },
  async addPost(_parent, args) {
    const orner = await DB.get({
      TableName: Tables.OrnersTable,
      Key: {
        Name: "id",
        Value: args.ornerId
      }
    })
      .promise()
      .catch(err => {
        throw new Error(err);
      });

    const id = nanoid();

    const post = {
      id,
      name: args.name,
      start: args.start,
      finish: args.finish,
      discription: args.discription,
      sumbnail: args.discription,
      images: [],
      visitors: [],
      orner: {
        id: orner.Item!.id,
        email: orner.Item!.email,
        name: orner.Item!.name,
        discription: orner.Item!.discription,
        icon: orner.Item!.icon,
        images: orner.Item!.images,
        address: orner.Item!.address,
        location: orner.Item!.location
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

    await DB.put({
      TableName: Tables.PostsTable,
      Item: post
    })
      .promise()
      .catch(err => {
        throw new Error(err);
      });

    return post;
  },
  async deletePost(_parent, args) {
    await DB.delete({
      TableName: Tables.PostsTable,
      Key: {
        Name: "id",
        Value: args.id
      }
    })
      .promise()
      .catch(err => {
        throw new ApolloError(err);
      });

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
