const pool = require('../config/db');

exports.getUserProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    const [users] = await pool.query('SELECT id, name, email, role, points, streak, created_at FROM users WHERE id = ?', [userId]);
    if (users.length === 0) return res.status(404).json({ message: 'User not found' });
    const user = users[0];

    // Get badges for user
    const [userBadges] = await pool.query(`
      SELECT b.* FROM badges b
      WHERE b.points_required <= ?
    `, [user.points]);
    user.badges = userBadges;

    // Get subjects the user has started (by checking video_progress)
    const [progressStats] = await pool.query(`
      SELECT 
        s.id AS subject_id,
        s.title,
        s.thumbnail_url,
        COUNT(DISTINCT v.id) AS total_videos,
        SUM(CASE WHEN vp.completed = 1 THEN 1 ELSE 0 END) AS completed_videos
      FROM subjects s
      JOIN sections sec ON s.id = sec.subject_id
      JOIN videos v ON sec.id = v.section_id
      LEFT JOIN video_progress vp ON v.id = vp.video_id AND vp.user_id = ?
      GROUP BY s.id
      HAVING SUM(CASE WHEN vp.user_id IS NOT NULL THEN 1 ELSE 0 END) > 0
    `, [userId]);

    const enrolled_subjects = progressStats.map(stat => ({
      ...stat,
      percent_complete: stat.total_videos > 0 ? Math.round((stat.completed_videos / stat.total_videos) * 100) : 0
    }));

    res.json({
      user,
      enrolled_subjects
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error fetching profile' });
  }
};
