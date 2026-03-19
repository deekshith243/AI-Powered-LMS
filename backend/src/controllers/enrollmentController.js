const pool = require('../config/db');

exports.enrollSubject = async (req, res) => {
  try {
    const { subject_id } = req.body;
    const user_id = req.user.id;
    
    if (!subject_id) {
      return res.status(400).json({ message: 'Subject ID is required' });
    }

    await pool.query(
      'INSERT IGNORE INTO enrollments (user_id, subject_id) VALUES (?, ?)',
      [user_id, subject_id]
    );

    res.status(200).json({ success: true, message: 'Successfully enrolled' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error during enrollment' });
  }
};

exports.saveSubject = async (req, res) => {
  try {
    const { subjectId } = req.body;
    const userId = req.user.id;

    if (!subjectId) {
      return res.status(400).json({ message: 'Subject ID is required' });
    }

    await pool.query(
      'INSERT IGNORE INTO saved_courses (user_id, subject_id) VALUES (?, ?)',
      [userId, subjectId]
    );

    res.status(200).json({ success: true, message: 'Course saved' });
  } catch (error) {
    console.error('Save error:', error);
    res.status(500).json({ message: 'Server error while saving course' });
  }
};
