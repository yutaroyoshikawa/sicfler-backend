/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { ApolloError } from "apollo-server-lambda";
import { QueryResolvers, Roles } from "./generated/graphql";
import { cognito, cognitoAdmin } from "./cognito";
import db, { Tables } from "./dynamoDB";

const Query: QueryResolvers = {
  async user(_parent, args) {
    const res = await cognitoAdmin
      .adminGetUser({
        UserPoolId: args.id,
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
      role: res.UserAttributes!.find(attribute => attribute.Name === "role")
        ?.Value as Roles
    };
  },
  async users() {
    const res = await cognito
      .listIdentities({
        IdentityPoolId: process.env.COGNITO_POOL_ID!,
        MaxResults: 100
      })
      .promise()
      .catch(err => {
        throw new ApolloError(err);
      });

    const users = res.Identities
      ? res.Identities.map(idetity => ({
          id: idetity.IdentityId!,
          creationDate: idetity.CreationDate!,
          lastModified: idetity.LastModifiedDate!
        }))
      : [];

    return users;
  },
  async orner(_parent, args) {
    const response = await db
      .get({
        TableName: Tables.OrnersTable,
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
      id: response.Item!.id,
      email: response.Item!.email,
      name: response.Item!.name,
      discription: response.Item!.discription,
      images: response.Item!.images
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
