const pool = require('../config/db');

class SubjectService {
  static async getAllSubjects(type) {
    let query = 'SELECT * FROM subjects';
    const params = [];
    
    if (type === 'free') {
      query += ' WHERE price = 0';
    } else if (type === 'paid') {
      query += ' WHERE price > 0';
    }
    
    const [rows] = await pool.query(query, params);
    return rows;
  }

  static async getSubject(id) {
    const [rows] = await pool.query('SELECT * FROM subjects WHERE id = ?', [id]);
    return rows[0];
  }

  static async getSubjectTree(subjectId, userId) {
    const [sections] = await pool.query('SELECT * FROM sections WHERE subject_id = ? ORDER BY order_index ASC', [subjectId]);
    
    const [videos] = await pool.query(`
      SELECT v.*, vp.completed
      FROM videos v
      JOIN sections s ON v.section_id = s.id
      LEFT JOIN video_progress vp ON v.id = vp.video_id AND vp.user_id = ?
      WHERE s.subject_id = ?
      ORDER BY s.order_index ASC, v.order_index ASC
    `, [userId, subjectId]);

    let anyPreviousIncomplete = false;
    
    const processedVideos = videos.map((v, index) => {
      let isLocked = false;
      if (index > 0 && anyPreviousIncomplete) {
        isLocked = true;
      }
      if (!v.completed) {
        anyPreviousIncomplete = true;
      }
      
      return {
        id: v.id,
        section_id: v.section_id,
        title: v.title,
        order_index: v.order_index,
        completed: !!v.completed,
        isLocked
      };
    });

    return sections.map(sec => ({
      ...sec,
      videos: processedVideos.filter(v => v.section_id === sec.id)
    }));
  }
}

module.exports = SubjectService;
