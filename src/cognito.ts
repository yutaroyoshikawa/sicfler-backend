/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { CognitoIdentityServiceProvider, config } from "aws-sdk";

config.update({ region: process.env.AWS_REGION! });

const cognito = new CognitoIdentityServiceProvider({
  apiVersion: "2016-04-18"
});

export enum Permissions {
  Admin = "ADMIN",
  Orner = "ORNER",
  User = "USER"
}

export default cognito;
