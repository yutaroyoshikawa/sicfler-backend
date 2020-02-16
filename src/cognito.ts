/* eslint-disable @typescript-eslint/no-non-null-assertion */
import {
  CognitoIdentityServiceProvider,
  CognitoIdentity,
  CognitoIdentityCredentials,
  config
} from "aws-sdk";

config.update({
  region: process.env.AWS_REGION!,
  credentials: new CognitoIdentityCredentials({
    IdentityPoolId: process.env.COGNITO_IDENTITY_POOL_ID!
  })
});

export const cognitoAdmin = new CognitoIdentityServiceProvider({
  apiVersion: "2016-04-18"
});

export const cognito = new CognitoIdentity({ apiVersion: "2014-06-30" });
