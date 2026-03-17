const express = require('express');
const router = express.Router();
const mediaController = require('../controllers/mediaController');
const { validateDownloadReq, validateInfoReq } = require('../middleware/validator');

router.get('/health', mediaController.getHealth);
router.get('/supported-platforms', mediaController.getSupportedPlatforms);
router.get('/info', validateInfoReq, mediaController.getInfo);
router.post('/download', validateDownloadReq, mediaController.download);

module.exports = router;
