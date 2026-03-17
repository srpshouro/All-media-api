# All-in-One Media Downloader API

A robust, production-ready REST API built with Node.js and `yt-dlp` to extract and download media (video, audio) from multiple platforms including YouTube, Instagram, Twitter/X, TikTok, Reddit, and more.

## Features
- **Multi-Platform Support**: Downloads from thousands of sites.
- **Direct Streaming**: Streams videos directly to the client, preventing server disk-space saturation.
- **Audio Extraction**: Can extract pure audio (`mp3`) from videos.
- **Quality Selection**: Support for High, Medium, and Low resolutions.
- **Security**: Built-in rate limiting, helmet security headers, and strict URL validation.
- **Optimized for Cloud Deployment**: Includes `render.yaml` for 1-click Render.com deployment.

---

## Getting Started (Local Development)

### 1. Prerequisites
- Node.js (v18+)
- FFmpeg (Optional but highly recommended for audio conversion/merging)

### 2. Installation
```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/media-downloader-api.git
cd media-downloader-api

# Install dependencies
npm install

# Create environment file
cp .env.example .env
