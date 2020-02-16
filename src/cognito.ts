/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { CognitoIdentity, config } from "aws-sdk";

config.update({ region: process.env.AWS_REGION! });

const cognito = new CognitoIdentity();

export enum Permissions {
  Admin = "ADMIN",
  Orner = "ORNER",
  User = "USER"
}

export default cognito;
