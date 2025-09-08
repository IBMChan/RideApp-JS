import {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile,
  updateUserPassword,
  getUserHistory,
} from "../services/user-service.js";
import jwt from "jsonwebtoken";

export const register = async (req, res) => {
  try {
    const { password, role } = req.body;

    if (!password || password.length < 8) {
      return res
        .status(400)
        .json({ message: "Password must be at least 8 characters long." });
    }

    if (!role || !["rider", "driver"].includes(role)) {
      return res.status(400).json({ message: "Role must be rider or driver." });
    }

    const newUser = await registerUser(req.body);
    res.status(201).json(newUser);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await loginUser(email, password);

    // Set cookie with token from service
    res.cookie("authToken", user.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 24 * 60 * 60 * 1000,
    });

    res.status(200).json({
      message: "Login successful",
      user: { userId: user.userId, role: user.role, email: user.email },
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};


export const logout = (req, res) => {
  try {
    res.clearCookie("authToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });
    res.status(200).json({ message: "Logout successful." });
  } catch (err) {
    res.status(500).json({ message: "Failed to logout." });
  }
};

export const getProfile = async (req, res) => {
  try {
    const user = await getUserProfile(req.user.userId);
    res.status(200).json(user);
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const success = await updateUserProfile(req.user.userId, req.body);
    if (success) {
      res.status(200).json({ message: "Profile updated successfully." });
    } else {
      res.status(404).json({ message: "User not found." });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const updatePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    if (!newPassword || newPassword.length < 8) {
      return res
        .status(400)
        .json({ message: "New password must be at least 8 characters long." });
    }
    const success = await updateUserPassword(
      req.user.userId,
      oldPassword,
      newPassword
    );
    if (success) {
      res.status(200).json({ message: "Password updated successfully." });
    } else {
      res.status(400).json({ message: "Password update failed." });
    }
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const getHistory = async (req, res) => {
  try {
    const rides = await getUserHistory(req.user.userId);
    res.status(200).json(rides);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
