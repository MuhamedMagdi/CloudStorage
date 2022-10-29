const stream = require('stream');
const { v4: uuidv4 } = require('uuid');

const User = require('../models/userModel');
const File = require('../models/fileModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const {
    upload,
    download,
    checkIfExists,
    remove,
} = require('../utils/firebase');

const getDownloadableFile = (res, data, file) => {
    const { name, mimetype } = file;
    const readStream = new stream.PassThrough();
    readStream.end(data);
    res.set('Content-disposition', 'attachment; filename=' + name);
    res.set('Content-Type', mimetype);
    return readStream.pipe(res);
};

exports.downloadFile = catchAsync(async (req, res, next) => {
    const { uuid } = req.params;
    const file = await File.findOne({ uuid }).select('+userId');
    const { username } = await User.findById(file.userId);
    const exists = await checkIfExists(`${username}/${uuid}`);
    if (
        !exists[0] ||
        (file.privacy === 'private' && !file.userId.equals(req.user.id))
    ) {
        return next(
            new AppError(
                `There is no file with uuid = ${uuid} or this file is private`,
                404
            )
        );
    }
    const data = await download(`${username}/${uuid}`);
    return getDownloadableFile(res, data[0], file);
});

exports.uploadFile = catchAsync(async (req, res, next) => {
    const { files } = req;
    const { privacy } = req.body;
    if (!files || !files.length) {
        return next(new AppError('You need to upload at least one file'));
    }
    if (
        privacy !== undefined &&
        privacy !== 'public' &&
        privacy !== 'private'
    ) {
        return next(
            new AppError(`You can't set the privacy to be ${privacy}`, 400)
        );
    }
    const user = await User.findById(req.user.id);
    let success = [];
    let fail = [];
    for (const file of files) {
        const fileName = file.originalname;
        const { buffer, mimetype, size } = file;
        const uuid = uuidv4();
        try {
            await upload(buffer, `${user.username}/${uuid}`);
            const newFile = await File.create({
                name: fileName,
                size,
                uuid,
                mimetype,
                userId: user.id,
            });
            success.push(newFile);
        } catch (error) {
            fail.push({
                fileName,
                error,
            });
        }
    }
    if (success.length) {
        return res.status(200).json({
            status: 'success',
            data: {
                success,
                fail,
            },
        });
    }
    return next(new AppError('There was a problem uploading your files', 500));
});

exports.getAllFiles = catchAsync(async (req, res, next) => {
    const files = await File.find({ userId: req.user.id });
    return res.status(200).json({
        status: 'success',
        data: files,
    });
});

exports.getFileByUUID = catchAsync(async (req, res, next) => {
    const { uuid } = req.params;
    const file = await File.findOne({ userId: req.user.id, uuid });
    return res.status(200).json({
        status: 'success',
        data: file,
    });
});

exports.updateFile = catchAsync(async (req, res, next) => {
    const { uuid } = req.params;
    const { name, privacy } = req.body;
    const file = await File.findOne({ userId: req.user.id, uuid });
    if (!file) {
        return next(
            new AppError(`The file with uuid = ${uuid} doesn't exists`, 404)
        );
    }
    if (name) {
        file.name = name;
    }
    if (privacy === 'public' || privacy === 'private') {
        file.privacy = privacy;
    } else if (privacy) {
        return next(
            new AppError(`You can't set the privacy to be ${privacy}`, 400)
        );
    }
    file.save();
    return res.status(200).json({
        statsu: 'success',
        data: file,
    });
});

exports.deleteFile = catchAsync(async (req, res, next) => {
    const { uuid } = req.params;
    const file = await File.findOne({ userId: req.user.id, uuid });
    const exists = await checkIfExists(`${req.user.username}/${uuid}`);
    if (!exists[0] || !file) {
        return next(new AppError(`This file doesn't exists`, 404));
    }
    await remove(`${req.user.username}/${uuid}`);
    await File.findOneAndDelete({ userId: req.user.id, uuid });
    return res.status(204).end();
});
