const express = require('express');

const {
    register,
    login,
    protect,
    forgotPassword,
    resetPassword,
    updatePassword,
    deactivate,
    activate,
    logout,
} = require('../controllers/authController');

const authRoutes = express.Router();

authRoutes.post('/register', register);
authRoutes.post('/login', login);
authRoutes.post('/forgot-password', forgotPassword);
authRoutes.post('/reset-password/:token', resetPassword);
authRoutes.patch('/update-password', protect, updatePassword);
authRoutes.delete('/deactivate', protect, deactivate);
authRoutes.post('/activate', activate);
authRoutes.get('/logout', logout);

module.exports = authRoutes;
