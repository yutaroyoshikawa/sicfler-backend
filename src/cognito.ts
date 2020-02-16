/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { CognitoIdentity, config } from "aws-sdk";

config.update({ region: process.env.AWS_REGION! });

const cognito = new CognitoIdentity({ apiVersion: "2012-08-10" });

export enum Permissions {
  Admin = "ADMIN",
  Orner = "ORNER",
  User = "USER"
}

export default cognito;
