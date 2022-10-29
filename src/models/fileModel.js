const mongoose = require('mongoose');

const fileSchema = mongoose.Schema({
    name: String,
    size: Number,
    uuid: {
        type: String,
        unique: true,
    },
    mimetype: String,
    privacy: {
        type: String,
        enum: ['public', 'private'],
        default: 'public',
    },
    userId: {
        type: mongoose.ObjectId,
        select: false,
    },
    uploadedAt: {
        type: Date,
        default: Date.now(),
    },
    updatedAt: Date,
});

fileSchema.pre('save', function (next) {
    if (this.isNew) {
        return next();
    }
    this.updatedAt = Date.now();
    next();
});

const File = mongoose.model('file', fileSchema);

module.exports = File;
