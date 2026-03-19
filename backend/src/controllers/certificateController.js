const PDFDocument = require('pdfkit');
const pool = require('../config/db');

exports.downloadCertificate = async (req, res) => {
  try {
    const userId = req.user.id;
    const subjectId = req.params.subjectId;

    // 1. Get User Name
    const [users] = await pool.query('SELECT name FROM users WHERE id = ?', [userId]);
    if (users.length === 0) return res.status(404).json({ message: 'User not found' });
    const userName = users[0].name;

    // 2. Get Subject Name & Progress Stats
    const [subjects] = await pool.query('SELECT title FROM subjects WHERE id = ?', [subjectId]);
    if (subjects.length === 0) return res.status(404).json({ message: 'Subject not found' });
    const subjectTitle = subjects[0].title;

    const [progressStats] = await pool.query(`
      SELECT 
        COUNT(DISTINCT v.id) AS total_videos,
        SUM(CASE WHEN vp.completed = 1 THEN 1 ELSE 0 END) AS completed_videos
      FROM subjects s
      JOIN sections sec ON s.id = sec.subject_id
      JOIN videos v ON sec.id = v.section_id
      LEFT JOIN video_progress vp ON v.id = vp.video_id AND vp.user_id = ?
      WHERE s.id = ?
    `, [userId, subjectId]);

    const stats = progressStats[0];
    const total = stats.total_videos || 0;
    const completed = stats.completed_videos || 0;
    
    if (total === 0 || completed < total) {
      return res.status(403).json({ message: 'Subject not fully completed. Cannot issue certificate yet.' });
    }

    // 3. Generate PDF
    const doc = new PDFDocument();
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'inline; filename=certificate.pdf');

    doc.pipe(res);

    doc.fontSize(26).text("Certificate of Completion", { align: "center" });
    doc.moveDown();
    
    doc.fontSize(18).text(`This certifies that`, { align: "center" });
    doc.moveDown();
    
    doc.fontSize(22).text(userName, { align: "center" });
    doc.moveDown();
    
    doc.fontSize(18).text(`has successfully completed`, { align: "center" });
    doc.moveDown();
    
    doc.fontSize(20).text(subjectTitle, { align: "center" });
    doc.moveDown();
    
    doc.text(`Date: ${new Date().toLocaleDateString()}`, { align: "center" });
    
    const percentage = Math.round((completed / total) * 100);
    doc.text(`Completion: ${percentage}%`, { align: "center" });

    doc.end();

  } catch (error) {
    console.error('Certificate Generation Error:', error);
    res.status(500).json({ message: 'Failed to generate certificate' });
  }
};
