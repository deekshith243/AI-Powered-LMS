const VideoService = require('../services/videoService');

exports.getVideoDetails = async (req, res) => {
  try {
    const userId = req.user.id;
    const video = await VideoService.getVideoDetails(req.params.videoId, userId);
    
    if (!video) return res.status(404).json({ message: 'Video not found' });
    
    res.json(video);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error fetching video' });
  }
};

exports.markVideoComplete = async (req, res) => {
  try {
    const userId = req.user.id;
    await VideoService.markVideoComplete(req.params.videoId, userId);
    res.json({ message: 'Video marked as complete' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error marking video complete' });
  }
}
