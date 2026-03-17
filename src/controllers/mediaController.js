const DownloaderService = require('../services/downloader');
const fs = require('fs');
const path = require('path');
const logger = require('../utils/logger');

const getInfo = async (req, res, next) => {
  try {
    const { url } = req.query;
    const metadata = await DownloaderService.getInfo(url);
    res.json({ success: true, data: metadata });
  } catch (error) {
    next(error);
  }
};

const download = async (req, res, next) => {
  try {
    const { url, format, quality } = req.body;
    const filePath = await DownloaderService.downloadMedia(url, format, quality);
    const fileName = path.basename(filePath);

    res.download(filePath, fileName, (err) => {
      if (err) {
        logger.error(`Stream error: ${err.message}`);
      }
      // Delete file after download
      fs.unlink(filePath, (unlinkErr) => {
        if (unlinkErr) logger.error(`File deletion error: ${unlinkErr.message}`);
      });
    });
  } catch (error) {
    next(error);
  }
};

const getHealth = (req, res) => {
  res.json({
    success: true,
    status: 'Operational',
    timestamp: new Date().toISOString()
  });
};

const getSupportedPlatforms = (req, res) => {
  const platforms = [
    'YouTube', 'Instagram', 'Facebook', 'Twitter/X', 
    'TikTok', 'Pinterest', 'Reddit', 'Vimeo', 'Twitch'
  ];
  res.json({ success: true, platforms });
};

module.exports = { getInfo, download, getHealth, getSupportedPlatforms };
