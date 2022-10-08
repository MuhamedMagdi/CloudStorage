const crypto = require('crypto');
const bcrypt = require('bcrypt');
const mongoose = require('mongoose');
const validator = require('validator');

const config = require('./../config');

const userSchema = mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please provid your name!'],
    },
    email: {
        type: String,
        required: [true, 'Please provide your email!'],
        unique: true,
        lowercase: true,
        validate: [validator.isEmail, 'Please provide a valid email!'],
    },
    role: {
        type: String,
        enum: ['admin', 'user'],
        default: 'user',
    },
    password: {
        type: String,
        required: [true, 'Please provide a password!'],
        minlength: 8,
        select: false,
    },
    passwordConfirm: {
        type: String,
        required: [true, 'Please confirm your password!'],
        validate: {
            validator: function (el) {
                return el === this.password;
            },
            message: 'Passwords are not the same!',
        },
    },
    passwordChangedAt: Date,
    passwordResetToken: String,
    passwordResetExpires: Date,
    active: {
        type: Boolean,
        default: true,
        select: false,
    },
});

userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        return next();
    }
    this.password = await bcrypt.hash(
        this.password + config.app.bcryptPaper,
        config.app.bcryptRounds
    );
    this.passwordConfirm = undefined;
});

userSchema.pre('save', function (next) {
    if (!this.isModified('password') || this.isNew) {
        return next();
    }
    this.passwordChangedAt = Date.now() - 1000;
    next();
});

userSchema.pre(/(?!findOneAndUpdate)(^find)/, function (next) {
    this.find({ active: { $ne: false } });
    next();
});

userSchema.methods.correctPassword = async function (
    candidatePassword,
    userPassword
) {
    return await bcrypt.compare(
        candidatePassword + config.app.bcryptPaper,
        userPassword
    );
};

userSchema.methods.changePasswordAfter = function (JWTTimestamp) {
    if (this.changePasswordAfter) {
        const changedTimestamp = parseInt(
            this.passwordChangedAt.getTime() / 1000
        );
        return JWTTimestamp < changedTimestamp;
    }
    return false;
};

userSchema.methods.createResetToken = function () {
    const resetToken = crypto.randomBytes(32).toString('hex');
    this.passwordResetToken = crypto
        .createHash('sha256')
        .update(resetToken)
        .digest('hex');
    this.passwordResetExpires = Date.now() + 10 * 60 * 1000;
    return resetToken;
};

const User = mongoose.model('user', userSchema);

module.exports = User;
