import { AuthenticationError, ApolloError } from "apollo-server-lambda";
import { promisify } from "util";
import jwt from "jsonwebtoken";
import jwkToPem from "jwk-to-pem";
import fetch from "node-fetch";
import { Roles } from "./generated/graphql";
import { cognitoAdmin, Attributes } from "./cognito";

interface TokenHeader {
  kid: string;
  alg: string;
}

interface PublicKey {
  alg: string;
  e: string;
  kid: string;
  kty: string;
  n: string;
  use: string;
}

interface PublicKeys {
  keys: PublicKey[];
}

interface PublicKeyMeta {
  instance: PublicKey;
  pem: string;
}

interface MapOfKidToPublicKey {
  [key: string]: PublicKeyMeta;
}

interface Claim {
  token_use: string;
  auth_time: number;
  iss: string;
  exp: number;
  username: string;
  client_id: string;
}

const COGNITO_ISSUER = `https://cognito-idp.${process.env.AWS_REGION}.amazonaws.com/${process.env.COGNITO_POOL_ID}`;

const getClaim = async (token: string): Promise<Claim> => {
  const generatePem = async (): Promise<MapOfKidToPublicKey> => {
    const getIssuer = async (): Promise<PublicKeys> => {
      const url = `${COGNITO_ISSUER}/.well-known/jwks.json`;
      const response = await fetch(url);
      return response.json();
    };

    const json = await getIssuer();

    return json.keys.reduce((agg: any, current: any) => {
      const pem = jwkToPem(current as any);
      // eslint-disable-next-line no-param-reassign
      agg[current.kid] = { instance: current, pem };
      return agg;
    }, {} as MapOfKidToPublicKey);
  };

  const tokenSections = (token || "").split(".");
  if (tokenSections.length < 2) {
    throw new AuthenticationError("requested token is invalid");
  }
  const headerJSON = Buffer.from(tokenSections[0], "base64").toString("utf8");
  const header = JSON.parse(headerJSON) as TokenHeader;
  const keys = await generatePem();
  const key = keys[header.kid];
  if (key === undefined) {
    throw new AuthenticationError("claim made for unknown kid");
  }
  const verifyPromised = promisify(jwt.verify.bind(jwt));
  const claim = (await verifyPromised(token, key.pem)) as Claim;

  return claim;
};

const validateClaim = (claim: Claim): void => {
  const currentSeconds = Math.floor(new Date().valueOf() / 1000);
  if (currentSeconds > claim.exp || currentSeconds < claim.auth_time) {
    throw new AuthenticationError("claim is expired or invalid");
  }
  if (claim.iss !== COGNITO_ISSUER) {
    throw new AuthenticationError("claim issuer is invalid");
  }
  if (claim.token_use !== "access") {
    throw new AuthenticationError("claim use is not access");
  }
};

const context = async (ctx: { event: any; context: any }) => {
  console.log(ctx.event.authorization);

  const token = ctx.event.headers.authorization || "";

  if (token) {
    const claim = await getClaim(token).catch(err => {
      throw new ApolloError(err);
    });
    validateClaim(claim);

    const res = await cognitoAdmin
      .adminGetUser({
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        UserPoolId: process.env.COGNITO_POOL_ID!,
        Username: claim.username
      })
      .promise()
      .catch(err => {
        throw new ApolloError(err);
      });

    const user = {
      userName: res.Username,
      creationDate: res.UserCreateDate,
      lastModified: res.UserLastModifiedDate,
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      role: res.UserAttributes!.find(
        attribute => attribute.Name === Attributes.Role
      )!.Value as Roles,
      isValid: true
    };

    return user;
  }

  const user = {
    userName: token,
    role: Roles.User,
    isValid: false
  };

  return user;
};

export default context;
