import { Config } from "apollo-server-lambda";
import { promisify } from "util";
import jwt from "jsonwebtoken";
import jwkToPem from "jwk-to-pem";
import fetch from "node-fetch";
import Mutation from "./mutation";
import Query from "./query";
import { Resolvers } from "./generated/graphql";
import typeDefs from "./graphql/schema.graphql";

const verifyPromised = promisify(jwt.verify.bind(jwt));

const resolvers: Resolvers = { Query, Mutation };

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

const getClaim = async (token: string): Promise<Claim> => {
  const generatePem = async (): Promise<MapOfKidToPublicKey> => {
    const getIssuer = async (): Promise<PublicKeys> => {
      const cognitoIssuer = `https://cognito-idp.us-east-1.amazonaws.com/${process.env.COGNITO_POOL_ID}`;
      const url = `${cognitoIssuer}/.well-known/jwks.json`;

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
    throw new Error("requested token is invalid");
  }
  const headerJSON = Buffer.from(tokenSections[0], "base64").toString("utf8");
  const header = JSON.parse(headerJSON) as TokenHeader;
  const keys = await generatePem();
  const key = keys[header.kid];
  if (key === undefined) {
    throw new Error("claim made for unknown kid");
  }
  const claim = (await verifyPromised(token, key.pem)) as Claim;

  return claim;
};

const context = async (ctx: { event: any; context: any }) => {
  const token = ctx.context.req.headers.authorization || "";

  if (token) {
    const claim = await getClaim(token);
    const currentSeconds = Math.floor(new Date().valueOf() / 1000);
    if (currentSeconds > claim.exp || currentSeconds < claim.auth_time) {
      throw new Error("claim is expired or invalid");
    }
    // if (claim.iss !== cognitoIssuer) {
    //   throw new Error("claim issuer is invalid");
    // }
    if (claim.token_use !== "access") {
      throw new Error("claim use is not access");
    }

    const user = {
      userName: claim.username,
      clientId: claim.client_id,
      isValid: true
    };

    return user;
  }

  const user = {
    userName: "",
    clientId: "",
    isValid: false
  };

  return user;
};

export default {
  typeDefs,
  resolvers,
  context
} as Config;
