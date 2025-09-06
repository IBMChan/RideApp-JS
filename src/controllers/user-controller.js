import {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile,
  updateUserPassword,
  getUserHistory,
} from "../services/user-service.js";

export const register = async (req, res) => {
  try {
    const { password } = req.body;
    if (!password || password.length < 8) {
      return res
        .status(400)
        .json({ message: "Password must be at least 8 characters long." });
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
    const { token } = await loginUser(email, password);

    res.cookie("authToken", token, {
      httpOnly: true,
      secure: false, // true in production with HTTPS
      sameSite: "strict",
    });

    res.status(200).json({ message: "Login successful" });
  } catch (err) {
    res.status(400).json({ message: err.message });
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

// ✅ Unified history for riders/drivers
export const getHistory = async (req, res) => {
  try {
    const rides = await getUserHistory(req.user);
    res.status(200).json(rides);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
