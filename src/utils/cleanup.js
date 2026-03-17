const fs = require('fs');
const path = require('path');
const logger = require('./logger');

const TEMP_DIR = path.join(process.cwd(), 'temp');

// Ensure temp directory exists
if (!fs.existsSync(TEMP_DIR)) {
  fs.mkdirSync(TEMP_DIR, { recursive: true });
}

// Cleanup files older than 1 hour
const cleanupTempFiles = () => {
  fs.readdir(TEMP_DIR, (err, files) => {
    if (err) return logger.error(`Cleanup error: ${err.message}`);

    const now = Date.now();
    files.forEach((file) => {
      const filePath = path.join(TEMP_DIR, file);
      fs.stat(filePath, (err, stats) => {
        if (err) return;
        
        // 1 hour = 3600000 ms
        if (now - stats.mtime.getTime() > 3600000) {
          fs.unlink(filePath, (err) => {
            if (!err) logger.info(`Cleaned up old file: ${file}`);
          });
        }
      });
    });
  });
};

// Run cleanup every 30 minutes
setInterval(cleanupTempFiles, 30 * 60 * 1000);

module.exports = { TEMP_DIR, cleanupTempFiles };
