import { registerUser, loginUser, getUserProfile, updateUserProfile, updateUserPassword } from '../services/user-service.js';

export const register = async (req, res) => {
    const { password } = req.body;

    if (!password || password.length < 8) {
        return res.status(400).json({ message: 'Password must be at least 8 characters long.' });
    }

    try {
        const newUser = await registerUser(req.body);
        res.status(201).json(newUser);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

export const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const result = await loginUser(email, password);
        res.status(200).json(result);
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
            res.status(200).json({ message: 'Profile updated successfully.' });
        } else {
            res.status(404).json({ message: 'User not found.' });
        }
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

export const updatePassword = async (req, res) => {
    const { oldPassword, newPassword } = req.body;

    if (!newPassword || newPassword.length < 8) {
        return res.status(400).json({ message: 'New password must be at least 8 characters long.' });
    }

    try {
        const success = await updateUserPassword(req.user.userId, oldPassword, newPassword);
        if (success) {
            res.status(200).json({ message: 'Password updated successfully.' });
        } else {
            res.status(400).json({ message: 'Password update failed.' });
        }
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};