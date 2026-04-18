import axios from "axios";
import { OAuth2Client } from "google-auth-library";
import { env } from "../config/env";
import { AppError } from "../utils/app-error";

const getClient = () =>
  new OAuth2Client({
    clientId: env.GOOGLE_CLIENT_ID,
    clientSecret: env.GOOGLE_CLIENT_SECRET,
    redirectUri: env.GOOGLE_REDIRECT_URI
  });

export const getGoogleAuthUrl = () => {
  if (!env.GOOGLE_CLIENT_ID || !env.GOOGLE_CLIENT_SECRET) {
    throw new AppError("Google OAuth credentials are not configured", 500);
  }

  return getClient().generateAuthUrl({
    access_type: "offline",
    scope: ["openid", "email", "profile"],
    prompt: "consent"
  });
};

export const exchangeGoogleCode = async (code: string) => {
  if (!env.GOOGLE_CLIENT_ID || !env.GOOGLE_CLIENT_SECRET) {
    throw new AppError("Google OAuth credentials are not configured", 500);
  }

  const client = getClient();
  const { tokens } = await client.getToken(code);
  client.setCredentials(tokens);

  const { data } = await axios.get<{
    email: string;
    name: string;
    picture?: string;
  }>("https://www.googleapis.com/oauth2/v2/userinfo", {
    headers: {
      Authorization: `Bearer ${tokens.access_token}`
    }
  });

  return data;
};
