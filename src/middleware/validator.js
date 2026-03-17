const isValidUrl = (urlString) => {
  try {
    const url = new URL(urlString);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch (e) {
    return false;
  }
};

const validateDownloadReq = (req, res, next) => {
  const { url, format, quality } = req.body;

  if (!url || !isValidUrl(url)) {
    return res.status(400).json({ success: false, error: 'Valid URL is required' });
  }

  const allowedFormats = ['video', 'audio', 'auto'];
  if (format && !allowedFormats.includes(format)) {
    return res.status(400).json({ success: false, error: 'Invalid format. Use video, audio, or auto' });
  }

  const allowedQualities = ['high', 'medium', 'low'];
  if (quality && !allowedQualities.includes(quality)) {
    return res.status(400).json({ success: false, error: 'Invalid quality. Use high, medium, or low' });
  }

  next();
};

const validateInfoReq = (req, res, next) => {
  const { url } = req.query;
  if (!url || !isValidUrl(url)) {
    return res.status(400).json({ success: false, error: 'Valid URL is required' });
  }
  next();
};

module.exports = { validateDownloadReq, validateInfoReq };
