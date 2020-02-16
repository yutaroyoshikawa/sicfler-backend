/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  SchemaDirectiveVisitor,
  AuthenticationError
} from "apollo-server-lambda";
import { defaultFieldResolver } from "graphql";

enum Roles {
  ADMIN,
  ORNER,
  USER
}

class ValidateRoleDirective extends SchemaDirectiveVisitor {
  private requiredRole: Roles = this.args.requires;

  public visitFieldDefinition = (field: any) => {
    const { resolve = defaultFieldResolver } = field;

    // eslint-disable-next-line no-param-reassign
    field.resolve = async (...args: any[]) => {
      if (Roles[this.context.role] > Roles[this.requiredRole]) {
        throw new AuthenticationError("アクセス権限がありません");
      }

      const result = await resolve.apply(this, args);
      return result;
    };
  };
}

export default {
  ValidateRoleDirective
};
