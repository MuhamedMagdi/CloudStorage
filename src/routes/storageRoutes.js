const express = require('express');
const multer = require('multer');

const {
    downloadFile,
    uploadFile,
    getAllFiles,
    getFileByUUID,
    updateFile,
    deleteFile,
} = require('../controllers/storageController');
const { protect } = require('../controllers/authController');

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const storageRoutes = express.Router();

storageRoutes.get('/download/:uuid', protect, downloadFile);
storageRoutes.post('/files', protect, upload.array('files'), uploadFile);
storageRoutes.get('/files', protect, getAllFiles);
storageRoutes.get('/files/:uuid', protect, getFileByUUID);
storageRoutes.patch('/files/:uuid', protect, updateFile);
storageRoutes.delete('/files/:uuid', protect, deleteFile);

module.exports = storageRoutes;
