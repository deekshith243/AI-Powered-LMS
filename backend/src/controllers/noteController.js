const pool = require('../config/db');

exports.getNote = async (req, res) => {
  try {
    const userId = req.user.id;
    const { videoId } = req.params;

    const [notes] = await pool.query('SELECT content, updated_at FROM notes WHERE user_id = ? AND video_id = ?', [userId, videoId]);
    
    if (notes.length === 0) {
      return res.json({ content: '' });
    }

    res.json(notes[0]);
  } catch (error) {
    console.error('Fetch Note Error:', error);
    res.status(500).json({ message: 'Failed to fetch note' });
  }
};

exports.saveNote = async (req, res) => {
  try {
    const userId = req.user.id;
    const { videoId } = req.params;
    const { content } = req.body;

    if (content === undefined) {
      return res.status(400).json({ message: 'Content is required' });
    }

    await pool.query(`
      INSERT INTO notes (user_id, video_id, content)
      VALUES (?, ?, ?)
      ON DUPLICATE KEY UPDATE content = VALUES(content), updated_at = CURRENT_TIMESTAMP
    `, [userId, videoId, content]);

    res.json({ message: 'Note saved successfully' });
  } catch (error) {
    console.error('Save Note Error:', error);
    res.status(500).json({ message: 'Failed to save note' });
  }
};
