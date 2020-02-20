/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { ApolloError, AuthenticationError } from "apollo-server-lambda";
import { QueryResolvers, Roles } from "./generated/graphql";
import { cognitoAdmin, Attributes } from "./cognito";
import db, { Tables } from "./dynamoDB";

// const IDENTITY_POOL_ID = process.env.COGNITO_IDENTITY_POOL_ID!;
const USER_POOL_ID = process.env.COGNITO_POOL_ID!;

const Query: QueryResolvers = {
  async myInfo(_parent, _args, context) {
    if (!context.isValid || !context.userName) {
      throw new AuthenticationError("アクセス権限がありません");
    }

    return {
      id: context.userName,
      creationDate: context.creationDate,
      lastModified: context.lastModified,
      email: context.email,
      role: context.role
    };
  },
  async user(_parent, args) {
    const res = await cognitoAdmin
      .adminGetUser({
        UserPoolId: USER_POOL_ID,
        Username: args.id
      })
      .promise()
      .catch(err => {
        throw new ApolloError(err);
      });

    return {
      id: res.Username,
      creationDate: res.UserCreateDate,
      lastModified: res.UserLastModifiedDate,
      email: res.UserAttributes!.find(
        attribute => attribute.Name === Attributes.Email
      )?.Value!,
      role:
        (res.UserAttributes!.find(
          attribute => attribute.Name === Attributes.Role
        )?.Value as Roles) || Roles.User
    };
  },
  async users() {
    const res = await cognitoAdmin
      .listUsers({
        UserPoolId: USER_POOL_ID
      })
      .promise()
      .catch(err => {
        throw new ApolloError(err);
      });

    const users = res.Users
      ? res.Users.map(idetity => ({
          id: idetity.Username!,
          creationDate: idetity.UserCreateDate!,
          lastModified: idetity.UserLastModifiedDate!,
          email: idetity.Attributes!.find(
            attribute => attribute.Name === Attributes.Email
          )?.Value!,
          role:
            (idetity.Attributes!.find(
              attribute => attribute.Name === Attributes.Role
            )?.Value as Roles) || Roles.User
        }))
      : [];

    return users;
  },
  async orner(_parent, args) {
    const response = await db
      .get({
        TableName: Tables.OrnersTable,
        Key: {
          id: args.id
        }
      })
      .promise()
      .catch(err => {
        throw new ApolloError(err);
      });

    return {
      id: response.Item!.id,
      email: response.Item!.email,
      name: response.Item!.name,
      discription: response.Item!.discription,
      icon: response.Item!.icon,
      images: response.Item!.images,
      address: response.Item!.address,
      location: response.Item!.location
    };
  },
  async orners() {
    const response = await db
      .scan({
        TableName: Tables.OrnersTable
      })
      .promise()
      .catch(err => {
        throw new ApolloError(err);
      });

    const orners = response.Items
      ? response.Items?.map(orner => ({
          id: orner.id,
          email: orner.email,
          name: orner.name,
          discription: orner.discription,
          icon: orner.icon,
          images: orner.images,
          address: orner.address,
          location: orner.location
        }))
      : [];

    return orners;
  },
  async post(_parent, args) {
    const response = await db
      .get({
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

    const orner = await db
      .get({
        TableName: Tables.OrnersTable,
        Key: {
          Name: "id",
          Value: response.Item!.orderId
        }
      })
      .promise()
      .catch(err => {
        throw new ApolloError(err);
      });

    return {
      id: response.Item!.id,
      name: response.Item!.name,
      start: response.Item!.start,
      finish: response.Item!.finish,
      images: response.Item!.images,
      visitors: response.Item!.visitors,
      orner: {
        id: orner.Item!.id,
        email: orner.Item!.email,
        name: orner.Item!.name,
        images: orner.Item!.images
      },
      target: response.Item!.target
    };
  },
  async posts(_parent, args) {
    if (args.ornerId) {
      const posts = await db
        .scan({
          TableName: Tables.PostsTable,
          FilterExpression: "#key = :key",
          ExpressionAttributeNames: {
            "#key": "ornerId"
          },
          ExpressionAttributeValues: {
            ":key": args.ornerId
          }
        })
        .promise()
        .catch(err => {
          throw new ApolloError(err);
        });

      const orner = await db
        .get({
          TableName: Tables.OrnersTable,
          Key: {
            id: args.ornerId
          }
        })
        .promise()
        .catch(err => {
          throw new ApolloError(err);
        });

      const includedOrnerInfoPosts: any[] = [];
      posts.Items!.forEach(post => {
        const result = {
          id: post.id,
          name: post.name,
          start: post.start,
          finish: post.finish,
          discription: post.discription,
          sumbnail: post.sumbnail,
          images: post.images,
          visitors: post.visitors,
          orner,
          address: post.address,
          location: post.location,
          target: post.target
        };
        includedOrnerInfoPosts.push(result);
      });

      return includedOrnerInfoPosts as any;
    }

    throw new ApolloError("idを今は指定してください。");
  }
};

export default Query;
