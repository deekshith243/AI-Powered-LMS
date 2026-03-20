const pool = require('../config/db');

class VideoService {
  static async getVideoDetails(videoId, userId) {
    const [videoRows] = await pool.query(`
      SELECT v.*, s.subject_id, vp.completed, sub.is_free, sub.price 
      FROM videos v 
      JOIN sections s ON v.section_id = s.id 
      JOIN subjects sub ON s.subject_id = sub.id
      LEFT JOIN video_progress vp ON v.id = vp.video_id AND vp.user_id = ?
      WHERE v.id = ?
    `, [userId, videoId]);
    
    if (videoRows.length === 0) return null;
    const video = videoRows[0];
    
    const [allVideos] = await pool.query(`
      SELECT v.id, vp.completed
      FROM videos v
      JOIN sections s ON v.section_id = s.id
      LEFT JOIN video_progress vp ON v.id = vp.video_id AND vp.user_id = ?
      WHERE s.subject_id = ?
      ORDER BY s.order_index ASC, v.order_index ASC
    `, [userId, video.subject_id]);
    
    const index = allVideos.findIndex(v => v.id === video.id);

    // Premium Check
    let isEnrolled = true;
    const isPaid = !video.is_free || video.price > 0;
    
    if (isPaid) {
      const [enrollment] = await pool.query('SELECT id FROM enrollments WHERE user_id = ? AND subject_id = ?', [userId, video.subject_id]);
      isEnrolled = enrollment.length > 0;
    }

    let prevId = null;
    let nextId = null;
    if (index > 0) prevId = allVideos[index - 1].id;
    if (index < allVideos.length - 1) nextId = allVideos[index + 1].id;

    // Block logic — ALL videos in paid courses require enrollment
    if (isPaid && !isEnrolled) {
      return {
        id: video.id,
        title: video.title,
        locked: true,
        unlock_reason: "Payment required",
        section_id: video.section_id,
        subject_id: video.subject_id,
        order_index: video.order_index,
        previous_video_id: prevId,
        next_video_id: nextId
      };
    }
    
    let isLocked = false;
    for (let i = 0; i < index; i++) {
        if (!allVideos[i].completed) {
            isLocked = true;
            break;
        }
    }
    
    let finalUrl = null;
    if (!isLocked && video.youtube_url) {
      const regExp = /^.*(youtu\.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
      const match = video.youtube_url.match(regExp);
      if (match && match[2].length === 11) {
        finalUrl = `https://www.youtube.com/watch?v=${match[2]}`;
      }
    }
    
    return {
      id: video.id,
      title: video.title,
      section_id: video.section_id,
      subject_id: video.subject_id,
      order_index: video.order_index,
      completed: !!video.completed,
      isLocked,
      previous_video_id: prevId,
      next_video_id: nextId,
      youtube_url: finalUrl
    };
  }

  static async markVideoComplete(videoId, userId) {
    const [result] = await pool.query(`
      INSERT INTO video_progress (user_id, video_id, completed) 
      VALUES (?, ?, TRUE) 
      ON DUPLICATE KEY UPDATE completed = TRUE
    `, [userId, videoId]);

    // If it was a new completion (not already completed), award points
    if (result.affectedRows > 0) {
      await pool.query('UPDATE users SET points = points + 10 WHERE id = ?', [userId]);
    }
    
    return { success: true };
  }
}

module.exports = VideoService;
