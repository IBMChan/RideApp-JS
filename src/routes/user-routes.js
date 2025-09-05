import express from 'express';
import jwt from 'jsonwebtoken';
import { registerUser, loginUser, getUserProfile, updateUserProfile, updateUserPassword, getRiderHistory } from '../services/user-service.js';

const router = express.Router();

const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'Access denied. No token provided.' });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ message: 'Invalid or expired token.' });
        }
        req.user = user;
        next();
    });
};

router.post('/register', async (req, res) => {
    try {
        const { password } = req.body;
        if (!password || password.length < 8) {
            return res.status(400).json({ message: 'Password must be at least 8 characters long.' });
        }
        const result = await registerUser(req.body);
        res.status(201).json(result);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const result = await loginUser(email, password);
        res.status(200).json(result);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

router.get('/profile', authenticateToken, async (req, res) => {
    try {
        const user = await getUserProfile(req.user.userId);
        res.status(200).json(user);
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
});

router.put('/profile', authenticateToken, async (req, res) => {
    try {
        const success = await updateUserProfile(req.user.userId, req.body);
        if (success) {
            res.status(200).json({ message: 'Profile updated successfully.' });
        } else {
            res.status(404).json({ message: 'User not found.' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.patch('/password', authenticateToken, async (req, res) => {
    try {
        const { oldPassword, newPassword } = req.body;
        if (!newPassword || newPassword.length < 8) {
            return res.status(400).json({ message: 'New password must be at least 8 characters long.' });
        }
        const success = await updateUserPassword(req.user.userId, oldPassword, newPassword);
        if (success) {
            res.status(200).json({ message: 'Password updated successfully.' });
        } else {
            res.status(400).json({ message: 'Password update failed.' });
        }
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

router.get('/history', authenticateToken, async (req, res) => {
    try {
        if (req.user.role !== 'rider') {
            return res.status(403).json({ message: 'Forbidden: Only riders can view their history.' });
        }
        const rides = await getRiderHistory(String(req.user.userId));
        res.status(200).json(rides);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

export default router;