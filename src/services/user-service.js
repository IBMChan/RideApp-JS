import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import {
  createUser,
  findUserByEmail,
  findUserById,
  updateUserProfile as updateUser,
  updateUserPassword as updatePass,
} from "../repository/mysql/users.repository.js";
import RidesRepository from "../repository/mongodb/rides.repository.js";

const rideRepo = new RidesRepository();

export const registerUser = async (userData) => {
  const existingUser = await findUserByEmail(userData.email);
  if (existingUser) {
    throw new Error("User with this email already exists.");
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(userData.password, salt);

  const newUser = await createUser({
    ...userData,
    hashedPassword,
  });
  return newUser;
};

export const loginUser = async (email, password) => {
  const user = await findUserByEmail(email);
  if (!user) {
    throw new Error("Invalid email or password.");
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new Error("Invalid email or password.");
  }

  const payload = {
    userId: user.user_id,
    role: user.role,
  };

  const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "1d" });

  return {
    userId: user.user_id,
    role: user.role,
    email: user.email,
    token,
  };
};


export const getUserProfile = async (userId) => {
  const user = await findUserById(userId);
  if (!user) {
    throw new Error("User not found.");
  }
  return user;
};

export const updateUserProfile = async (userId, profileData) => {
  return await updateUser(userId, profileData);
};

export const updateUserPassword = async (userId, oldPassword, newPassword) => {
  const user = await findUserByEmail((await findUserById(userId)).email);

  const isMatch = await bcrypt.compare(oldPassword, user.password);
  if (!isMatch) {
    throw new Error("Incorrect old password.");
  }

  const salt = await bcrypt.genSalt(10);
  const hashedNewPassword = await bcrypt.hash(newPassword, salt);

  return await updatePass(userId, hashedNewPassword);
};

// ✅ Rider/Driver history
export const getUserHistory = async (user) => {
  if (user.role === "rider") {
    return await rideRepo.findByRiderId(user.userId);
  }

  if (user.role === "driver") {
    return await rideRepo.findByDriverId(user.userId);
  }

  throw new Error("Invalid role. Only riders or drivers can view ride history.");
};
