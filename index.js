const express = require('express');
const cors = require('cors');
const ytdl = require('ytdl-core');

const app = express();
const port = 4000;

app.use(cors());

const sanitizeFilename = (filename) => {
  return filename.replace(/[^a-z0-9_\-]/gi, '_');
};

app.get('/download', async (req, res) => {
  const videoURL = req.query.url;
  const format = req.query.format || 'mp4'; // Default to mp4
  const videoQuality = req.query.videoQuality || 'lowest'; // Default to lowest video quality
  const audioQuality = req.query.audioQuality || 'highest'; // Default to highest audio quality

  if (!videoURL) {
    console.error('URL is required');
    return res.status(400).send('URL is required');
  }

  try {
    console.log(`Fetching video info for URL: ${videoURL}`);
    const info = await ytdl.getInfo(videoURL);
    let videoFormat = ytdl.chooseFormat(info.formats, { filter: format === 'mp3' ? 'audioonly' : 'videoonly', quality: videoQuality });
    let audioFormat = ytdl.chooseFormat(info.formats, { filter: 'audioonly', quality: audioQuality });

    const sanitizedFilename = sanitizeFilename(info.videoDetails.title);

    res.setHeader('Content-Disposition', `attachment; filename="${sanitizedFilename}.${format}"`);
    res.setHeader('Content-Type', format === 'mp3' ? 'audio/mpeg' : 'video/mp4');

    const videoStream = ytdl(videoURL, { format: videoFormat });
    const audioStream = ytdl(videoURL, { format: audioFormat });

    videoStream.on('error', (err) => {
      console.error('Error during download:', err);
      res.status(500).send('Error downloading video');
    });

    audioStream.on('error', (err) => {
      console.error('Error during download:', err);
      res.status(500).send('Error downloading audio');
    });

    videoStream.pipe(res, { end: false });
    audioStream.pipe(res, { end: false });

    videoStream.on('end', () => {
      console.log('Video stream ended');
      audioStream.end();
    });

    audioStream.on('end', () => {
      console.log('Audio stream ended');
      res.end();
    });

  } catch (error) {
    console.error('Error fetching video info:', error);
    res.status(500).send('Error downloading video');
  }
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
