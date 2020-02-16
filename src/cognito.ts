/* eslint-disable @typescript-eslint/no-non-null-assertion */
import {
  CognitoIdentityServiceProvider,
  CognitoIdentity,
  config
} from "aws-sdk";

config.update({
  region: process.env.AWS_REGION!
});

export const cognitoAdmin = new CognitoIdentityServiceProvider({
  apiVersion: "2016-04-18"
});

export const cognito = new CognitoIdentity({ apiVersion: "2014-06-30" });
