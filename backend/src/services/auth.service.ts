import bcrypt from "bcryptjs";
import { UserRole } from "../constants/enums";
import { OrganizerProfileModel } from "../models/OrganizerProfile";
import { UserDocument, UserModel } from "../models/User";
import { AppError } from "../utils/app-error";
import { signJwt } from "../utils/jwt";

type RegisterInput = {
  name: string;
  email: string;
  password: string;
  role: UserRole;
};

const ensureOrganizerProfile = async (user: UserDocument) => {
  const existingProfile = await OrganizerProfileModel.findOne({ userId: user._id });
  if (!existingProfile) {
    await OrganizerProfileModel.create({
      userId: user._id,
      displayName: user.name
    });
  }
};

const ensureOrganizerUser = async (user: UserDocument) => {
  if (user.role === "admin") {
    return user;
  }

  if (user.role !== "organizer") {
    user.role = "organizer";
    await user.save();
  }

  await ensureOrganizerProfile(user);
  return user;
};

const sanitizeUser = (user: UserDocument) => ({
  id: user._id.toString(),
  name: user.name,
  email: user.email,
  role: user.role,
  avatar: user.avatar,
  provider: user.provider
});

const issueAuthPayload = (user: UserDocument) => ({
  token: signJwt({
    sub: user._id.toString(),
    email: user.email,
    role: user.role,
    name: user.name
  }),
  user: sanitizeUser(user)
});

export const registerUser = async (input: RegisterInput) => {
  const existingUser = await UserModel.findOne({ email: input.email });
  if (existingUser) {
    throw new AppError("An account with this email already exists", 409);
  }

  const passwordHash = await bcrypt.hash(input.password, 10);
  const normalizedRole = input.role === "admin" ? "admin" : "organizer";
  const user = await UserModel.create({
    name: input.name,
    email: input.email,
    passwordHash,
    role: normalizedRole,
    provider: "local"
  });

  if (normalizedRole === "organizer") {
    await ensureOrganizerProfile(user);
  }

  return issueAuthPayload(user);
};

export const loginUser = async (email: string, password: string) => {
  const user = await UserModel.findOne({ email });
  if (!user?.passwordHash) {
    throw new AppError("Invalid email or password", 401);
  }

  const isValid = await bcrypt.compare(password, user.passwordHash);
  if (!isValid) {
    throw new AppError("Invalid email or password", 401);
  }

  const normalizedUser = await ensureOrganizerUser(user);
  return issueAuthPayload(normalizedUser);
};

export const getOwnProfile = async (userId: string) => {
  const user = await UserModel.findById(userId);
  if (!user) {
    throw new AppError("User not found", 404);
  }

  const normalizedUser = await ensureOrganizerUser(user);
  const organizerProfile =
    normalizedUser.role === "organizer"
      ? await OrganizerProfileModel.findOne({ userId: normalizedUser._id })
      : null;

  return {
    ...sanitizeUser(normalizedUser),
    organizerProfile
  };
};

export const upsertGoogleUser = async (profile: {
  email: string;
  name: string;
  picture?: string;
}) => {
  let user = await UserModel.findOne({ email: profile.email });

  if (!user) {
    user = await UserModel.create({
      name: profile.name,
      email: profile.email,
      avatar: profile.picture ?? "",
      provider: "google",
      role: "organizer"
    });
  } else if (profile.picture && !user.avatar) {
    user.avatar = profile.picture;
    await user.save();
  }

  const normalizedUser = await ensureOrganizerUser(user);
  return issueAuthPayload(normalizedUser);
};
