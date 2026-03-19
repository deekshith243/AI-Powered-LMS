const pool = require('../config/db');

exports.getVideoProgress = async (req, res) => {
  try {
    const userId = req.user?.id;
    const videoId = req.params.videoId;

    if (!userId || !videoId) {
      return res.json({ last_position_seconds: 0, is_completed: false });
    }

    const [progress] = await pool.query(
      'SELECT last_position_seconds, completed FROM video_progress WHERE user_id = ? AND video_id = ?',
      [userId, videoId]
    );

    if (progress.length === 0) {
      return res.json({ last_position_seconds: 0, is_completed: false });
    }

    return res.json({
      last_position_seconds: progress[0].last_position_seconds || 0,
      is_completed: !!progress[0].completed
    });
  } catch (error) {
    console.error('Error in getVideoProgress:', error.message || error);
    // Safe fallback to prevent frontend from showing "Video unavailable"
    return res.status(200).json({ last_position_seconds: 0, is_completed: false });
  }
};

exports.updateVideoProgress = async (req, res) => {
  try {
    const userId = req.user.id;
    const videoId = req.params.videoId;
    const { last_position_seconds, is_completed } = req.body;

    // Optional: cap last_position_seconds to actual video duration if we knew it. 
    // Usually video duration is required from frontend or YouTube API. We trust frontend here.
    const pos = Math.floor(Math.max(0, last_position_seconds || 0));
    const completed = is_completed ? 1 : 0;

    await pool.query(`
      INSERT INTO video_progress (user_id, video_id, last_position_seconds, completed)
      VALUES (?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE 
        last_position_seconds = VALUES(last_position_seconds),
        completed = IF(completed = 1, 1, VALUES(completed)) 
    `, [userId, videoId, pos, completed]);
    // Note: IF(completed = 1, 1, VALUES(completed)) ensures we never un-complete a video once completed.

    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error updating progress' });
  }
};

exports.getSubjectProgress = async (req, res) => {
  try {
    const userId = req.user.id;
    const subjectId = req.params.subjectId;

    // Get all videos in subject
    const [videos] = await pool.query(`
      SELECT v.id 
      FROM videos v 
      JOIN sections s ON v.section_id = s.id 
      WHERE s.subject_id = ?
    `, [subjectId]);

    const total_videos = videos.length;
    if (total_videos === 0) {
      return res.json({ total_videos: 0, completed_videos: 0, percent_complete: 0, last_video_id: null });
    }

    // Get completed videos for this subject and user
    const [progress] = await pool.query(`
      SELECT vp.video_id, vp.completed, vp.updated_at
      FROM video_progress vp
      JOIN videos v ON vp.video_id = v.id
      JOIN sections s ON v.section_id = s.id
      WHERE s.subject_id = ? AND vp.user_id = ?
    `, [subjectId, userId]);

    const completed_videos = progress.filter(p => p.completed).length;
    const percent_complete = Math.round((completed_videos / total_videos) * 100);

    // Get the most recently interacted video
    let last_video_id = null;
    if (progress.length > 0) {
      const sorted = progress.sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at));
      last_video_id = sorted[0].video_id;
    }

    res.json({
      total_videos,
      completed_videos,
      percent_complete,
      last_video_id
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error fetching subject progress' });
  }
};
