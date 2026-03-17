const youtubedl = require('youtube-dl-exec');
const ffmpeg = require('ffmpeg-static');
const path = require('path');
const fs = require('fs');
const { TEMP_DIR } = require('../utils/cleanup');
const logger = require('../utils/logger');

class DownloaderService {
  
  static getFormatString(format, quality) {
    if (format === 'audio') {
      return 'bestaudio/best';
    }
    
    // Video configurations
    switch (quality) {
      case 'high':
        return 'bestvideo[height<=1080][ext=mp4]+bestaudio[ext=m4a]/best[ext=mp4]/best';
      case 'low':
        return 'bestvideo[height<=480][ext=mp4]+bestaudio[ext=m4a]/best[height<=480][ext=mp4]/best';
      case 'medium':
      default:
        return 'bestvideo[height<=720][ext=mp4]+bestaudio[ext=m4a]/best[height<=720][ext=mp4]/best';
    }
  }

  static async getInfo(url) {
    try {
      const output = await youtubedl(url, {
        dumpSingleJson: true,
        noCheckCertificates: true,
        noWarnings: true,
        preferFreeFormats: true,
        addHeader: ['referer:youtube.com', 'user-agent:Mozilla/5.0']
      });

      return {
        title: output.title,
        duration: output.duration,
        thumbnail: output.thumbnail,
        extractor: output.extractor,
        formats: output.formats.map(f => ({
          format_id: f.format_id,
          ext: f.ext,
          resolution: f.resolution,
          filesize: f.filesize
        }))
      };
    } catch (error) {
      logger.error(`GetInfo Error: ${error.message}`);
      throw new Error('Failed to fetch media metadata. The URL might be invalid or unsupported.');
    }
  }

  static async downloadMedia(url, format = 'video', quality = 'medium') {
    const filename = `${Date.now()}_${Math.random().toString(36).substring(7)}.%(ext)s`;
    const outputPath = path.join(TEMP_DIR, filename);

    const formatString = this.getFormatString(format, quality);

    const flags = {
      format: formatString,
      output: outputPath,
      noCheckCertificates: true,
      noWarnings: true,
      ffmpegLocation: ffmpeg, // Using static ffmpeg for Render compatibility
    };

    if (format === 'audio') {
      flags.extractAudio = true;
      flags.audioFormat = 'mp3';
    } else {
      flags.mergeOutputFormat = 'mp4';
    }

    try {
      logger.info(`Starting download: ${url} | Format: ${format} | Quality: ${quality}`);
      await youtubedl(url, flags);
      
      // youtubedl uses templates %(ext)s, we need to find the actual file generated
      const files = fs.readdirSync(TEMP_DIR);
      const generatedFile = files.find(f => f.startsWith(filename.split('.')[0]));
      
      if (!generatedFile) throw new Error("File generation failed");
      
      return path.join(TEMP_DIR, generatedFile);
    } catch (error) {
      logger.error(`Download Error: ${error.message}`);
      throw new Error('Failed to download media. The platform might be restricting access.');
    }
  }
}

module.exports = DownloaderService;
