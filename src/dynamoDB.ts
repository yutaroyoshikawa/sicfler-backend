/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { DynamoDB, config } from "aws-sdk";

config.update({ region: process.env.AWS_REGION! });

const DB = new DynamoDB.DocumentClient({ apiVersion: "2012-08-10" });

export enum Tables {
  PostsTable = "sicfler-posts",
  OrnersTable = "sicfler-orners"
}

export default DB;
