const express = require('express');

const auth = require('./authRoutes');

const router = express.Router();

router.use('/auth', auth);

module.exports = router;
