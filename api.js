const express = require('express');
const ytDl = require('yt-dlp-exec');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;

// API Route to fetch video info and formats
app.get('/api/info', async (req, res) => {
    const videoUrl = req.query.url;

    if (!videoUrl) {
        return res.status(400).json({ error: 'URL is required' });
    }

    try {
        // Fetching all metadata from the link
        const output = await ytDl(videoUrl, {
            dumpSingleJson: true,
            noCheckCertificates: true,
            noWarnings: true,
            preferFreeFormats: true,
            addHeader: ['referer:facebook.com', 'user-agent:googlebot']
        });

        // Filtering formats
        const formats = output.formats.map(f => ({
            format_id: f.format_id,
            resolution: f.resolution || f.format_note,
            extension: f.ext,
            url: f.url,
            filesize: f.filesize,
            quality: f.height // 360, 480, 720 etc.
        }));

        // Audio only (High Quality)
        const audioWav = output.formats
            .filter(f => f.vcodec === 'none' && (f.ext === 'm4a' || f.ext === 'mp3' || f.ext === 'wav'))
            .pop();

        res.json({
            title: output.title,
            thumbnail: output.thumbnail,
            duration: output.duration_string,
            source: output.extractor,
            available_resolutions: {
                "360p": formats.find(f => f.quality === 360 && f.extension === 'mp4')?.url || null,
                "480p": formats.find(f => f.quality === 480 && f.extension === 'mp4')?.url || null,
                "720p": formats.find(f => f.quality === 720 && f.extension === 'mp4')?.url || null,
                "audio_high": audioWav ? audioWav.url : null
            },
            all_links: formats // full list if you want more options
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to process URL. It might be private or unsupported.' });
    }
});

app.listen(PORT, () => {
    console.log(`Downloader Engine running on port ${PORT}`);
});
