/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { DynamoDB, config } from "aws-sdk";

config.update({ region: process.env.AWS_REGION! });

const DB = new DynamoDB.DocumentClient({ apiVersion: "2012-08-10" });

export enum Tables {
  UserTable = "sicfler-users",
  PostsTable = "sicfler-posts",
  OrnersTable = "sicfler-orners"
}

export enum Permissions {
  User = "user",
  Orner = "orner",
  Admin = "admin"
}

export default DB;
