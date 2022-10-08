const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const User = require('../models/userModel');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const config = require('../config');
const sendEmail = require('../utils/email');

const signToken = (id) => {
    return jwt.sign({ id }, config.app.jwtSecret, {
        expiresIn: config.app.jwtExpiresIn,
    });
};

const createSendToken = (user, statusCode, req, res) => {
    const token = signToken(user._id);
    res.cookie('jwt', token, {
        maxAge: config.app.jwtCookieExpiresIn * 24 * 60 * 60 * 1000,
        httpOnly: true,
        secure: req.secure || req.headers['x-forwarded-proto'] === 'https',
    });
    user.password = undefined;
    res.status(statusCode).json({
        status: 'success',
        token,
        data: {
            user,
        },
    });
};

exports.register = catchAsync(async (req, res, next) => {
    const newUser = await User.create({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
        passwordConfirm: req.body.passwordConfirm,
    });
    return createSendToken(newUser, 201, req, res);
});

exports.login = catchAsync(async (req, res, next) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return next(new AppError('Please provide email and password', 400));
    }
    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.correctPassword(password, user.password))) {
        return next(new AppError('Incorrect eamil or password!', 401));
    }
    return createSendToken(user, 200, req, res);
});

exports.protect = catchAsync(async (req, res, next) => {
    if (!req.cookies.jwt) {
        return next(
            new AppError(
                'You are not logged in! Please login to get access.',
                401
            )
        );
    }
    const token = req.cookies.jwt;
    const decoded = await jwt.verify(token, config.app.jwtSecret);
    const user = await User.findById(decoded.id);
    if (!user) {
        return next(
            new AppError(
                'The user belonging to this token does no longer exist.',
                401
            )
        );
    }
    if (user.changePasswordAfter(decoded.iat)) {
        return next(
            new AppError(
                'User recently changed password! Please login again.',
                401
            )
        );
    }
    req.user = user;
    next();
});

exports.restrictTo = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return next(
                new AppError(
                    'You do not have permission to preform this action',
                    403
                )
            );
        }
        next();
    };
};

exports.forgotPassword = catchAsync(async (req, res, next) => {
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
        return next(
            new AppError('There is no user with this email address', 404)
        );
    }
    const resetToken = user.createResetToken();
    await user.save({ validateBeforeSave: false });
    const resetURL = `${req.protocol}://${req.get(
        'host'
    )}/api/v1/auth/reset-password/${resetToken}`;
    const message = `Forgot your password? Submit a PATCH request with your new password and passwordConfirm to: ${resetURL}.\nIf you didn't forget your password, please ignore this email!`;
    try {
        await sendEmail({
            email: req.body.email,
            subject: 'Your password reset token (valid for 10 min)',
            message,
        });
        res.status(200).json({
            status: 'success',
            message: 'Token sent to your email',
        });
    } catch (err) {
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;
        await user.save({ validateBeforeSave: false });
        return next(
            new AppError(
                'There wan an error sending the email. try again later',
                500
            )
        );
    }
});

exports.resetPassword = catchAsync(async (req, res, next) => {
    const hashedToken = await crypto
        .createHash('sha256')
        .update(req.params.token)
        .digest('hex');
    const user = await User.findOne({
        passwordResetToken: hashedToken,
        passwordResetExpires: { $gt: Date.now() },
    });
    if (!user) {
        return next(new AppError('Token is invalid or has expired', 400));
    }
    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();
    createSendToken(user, 200, req, res);
});

exports.updatePassword = catchAsync(async (req, res, next) => {
    const user = await User.findById(req.user.id).select('+password');
    if (
        !(await user.correctPassword(req.body.passwordCurrent, user.password))
    ) {
        return next(new AppError('Your current password is wrong!', 401));
    }
    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;
    await user.save();
    createSendToken(user, 200, req, res);
});

exports.deactivate = catchAsync(async (req, res, next) => {
    const { password } = req.body;
    const user = await User.findById(req.user.id).select('+password +active');
    if (!password) {
        return next(
            new AppError(
                'Please provide your password to deactivate you account',
                400
            )
        );
    }
    if (!(await user.correctPassword(password, user.password))) {
        return next(new AppError('Incorrect password', 401));
    }
    user.active = false;
    user.save({ validateBeforeSave: false });
    res.status(204).end();
});

exports.activate = catchAsync(async (req, res, next) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return next(new AppError('Please provide email and password', 400));
    }
    const user = await User.findOneAndUpdate(
        { email },
        { active: true },
        { new: true }
    ).select('+password');
    if (!user || !(await user.correctPassword(password, user.password))) {
        await User.findOneAndUpdate({ email }, { active: false });
        return next(new AppError('Incorrect email or password'));
    }
    res.status(200).json({
        status: 'success',
        message: 'Your account has been activated',
    });
});

exports.logout = (req, res) => {
    res.clearCookie('jwt');
    res.status(205).end();
};
