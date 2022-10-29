const express = require('express');
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('../../swagger.json');

const auth = require('./authRoutes');
const storage = require('./storageRoutes');

const router = express.Router();

router.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
router.use('/auth', auth);
router.use('/storage', storage);
module.exports = router;
