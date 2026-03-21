const pool = require('../config/db');

exports.applyForJob = async (req, res) => {
  try {
    const { company, role } = req.body;
    const userId = req.user.id;

    await pool.query(
      'INSERT INTO applications (user_id, company, role, status) VALUES (?, ?, ?, ?)',
      [userId, company, role, 'Applied']
    );

    res.json({ success: true, message: 'Application tracked successfully' });
  } catch (err) {
    console.error("Apply Tracker Error:", err.message);
    res.status(500).json({ error: 'Failed to track application' });
  }
};

exports.getAppliedJobs = async (req, res) => {
  try {
    const userId = req.user.id;
    const [rows] = await pool.query(
      'SELECT company, role, applied_date as date, status FROM applications WHERE user_id = ? ORDER BY applied_date DESC',
      [userId]
    );
    res.json(rows);
  } catch (err) {
    console.error("Fetch Applied Error:", err.message);
    res.status(500).json({ error: 'Failed to fetch applied jobs' });
  }
};
