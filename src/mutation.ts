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
      creationDate: response.User?.UserCreateDate!,
      lastModifiedDate: response.User?.UserLastModifiedDate,
      email: response.User?.Attributes?.find(
        attribute => attribute.Name === Attributes.Email
      )?.Value!,
      role:
        (response.User?.Attributes?.find(
          attribute => attribute.Name === Attributes.Role
        )?.Value as Roles) || Roles.User
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
      id: args.id
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
  async deleteOrner(_parent, args) {
    await DB.delete({
      TableName: Tables.OrnersTable,
      Key: {
        id: args.id
      }
    })
      .promise()
      .catch(err => {
        throw new ApolloError(err);
      });

    await cognitoAdmin
      .adminUpdateUserAttributes({
        UserPoolId: USER_POOL_ID,
        Username: args.id,
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
      id: args.id
    };
  },
  async updateUser(_parent, args) {
    await cognitoAdmin
      .adminUpdateUserAttributes({
        UserPoolId: USER_POOL_ID,
        Username: args.id,
        UserAttributes: [
          {
            Name: Attributes.Role,
            Value: args.role
          },
          {
            Name: Attributes.Email,
            Value: args.email
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
      creationDate: user.UserCreateDate!,
      lastModifiedDate: user.UserLastModifiedDate!,
      email: user.UserAttributes?.find(
        attribute => attribute.Name === Attributes.Email
      )?.Value!,
      role:
        (user.UserAttributes?.find(
          attribute => attribute.Name === Attributes.Role
        )?.Value as Roles) || Roles.User
    };
  },
  async addPost(_parent, args) {
    const orner = await DB.get({
      TableName: Tables.OrnersTable,
      Key: {
        id: args.ornerId
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
      sumbnail: args.sumbnail,
      images: args.images,
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
        ageGroup: args.target.ageGroup,
        gender: args.target.gender
      }
    };

    await DB.put({
      TableName: Tables.PostsTable,
      Item: {
        id,
        name: args.name,
        start: args.start,
        finish: args.finish,
        discription: args.discription,
        sumbnail: args.sumbnail,
        images: args.images,
        visitors: [],
        ornerId: orner.Item!.id,
        address: args.address,
        location: {
          xIndex: args.location?.xIndex,
          yIndex: args.location?.yIndex
        },
        target: {
          ageGroup: args.target.ageGroup,
          gender: args.target.gender
        }
      }
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
        id: args.id
      }
    })
      .promise()
      .catch(err => {
        throw new ApolloError(err);
      });

    return {
      id: args.id
    };
  }
};

export default Mutation;
