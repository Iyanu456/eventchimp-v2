import jwt, { Secret, SignOptions } from "jsonwebtoken";
import { env } from "../config/env";
import { UserRole } from "../constants/enums";

type JwtPayload = {
  sub: string;
  email: string;
  role: UserRole;
  name: string;
};

export const signJwt = (payload: JwtPayload) =>
  jwt.sign(payload, env.JWT_SECRET as Secret, {
    expiresIn: env.JWT_EXPIRES_IN as SignOptions["expiresIn"]
  });

export const verifyJwt = (token: string) => jwt.verify(token, env.JWT_SECRET) as JwtPayload;
