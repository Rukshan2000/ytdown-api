import React, { useState } from 'react';
import axios from 'axios';

const Downloader = () => {
  const [videoUrl, setVideoUrl] = useState('');
  const [format, setFormat] = useState('mp4'); // Default to mp4
  const [error, setError] = useState('');
  const [downloading, setDownloading] = useState(false);

  const handleDownload = async () => {
    setError('');
    setDownloading(true);
    try {
      const response = await axios.get(`https://ytdown-api.vercel.app/download?url=${encodeURIComponent(videoUrl)}&format=${format}&quality=medium`, {
        responseType: 'blob',
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `video.${format}`);
      document.body.appendChild(link);
      link.click();
    } catch (err) {
      setError('Error downloading video');
      console.error('Error downloading video:', err);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="p-4">
      <h1 className="mb-4 text-2xl">YouTube Video Downloader</h1>
      <input
        type="text"
        value={videoUrl}
        onChange={(e) => setVideoUrl(e.target.value)}
        placeholder="Enter YouTube video URL"
        className="w-full p-2 mb-4 border"
      />
      <div className="mb-4">
        <label className="mr-2">Format:</label>
        <select value={format} onChange={(e) => setFormat(e.target.value)} className="p-2 border">
          <option value="mp4">Video</option>
          <option value="mp3">Audio</option>
        </select>
      </div>
      <button onClick={handleDownload} className="px-4 py-2 text-white bg-blue-500 rounded">
        Download Video
      </button>
      {downloading && <p className="mt-4 text-blue-500">Downloading your video, please wait...</p>}
      {error && <p className="mt-4 text-red-500">{error}</p>}
    </div>
  );
};

export default Downloader;
