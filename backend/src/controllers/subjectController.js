const SubjectService = require('../services/subjectService');
const optionalAuth = require('../middlewares/optionalAuthMiddleware');

exports.getSubjects = async (req, res) => {
  try {
    const { type } = req.query;
    const userId = req.user ? req.user.id : null;
    const subjects = await SubjectService.getAllSubjects(type, userId);
    res.json(subjects);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error fetching subjects' });
  }
};

exports.getSubjectDetails = async (req, res) => {
  try {
    const subject = await SubjectService.getSubject(req.params.subjectId);
    if (!subject) return res.status(404).json({ message: 'Subject not found' });
    res.json(subject);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error fetching subject details' });
  }
};

exports.getSubjectTree = async (req, res) => {
  try {
    const userId = req.user.id;
    const tree = await SubjectService.getSubjectTree(req.params.subjectId, userId);
    res.json(tree);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error fetching subject tree' });
  }
};

exports.checkAccess = async (req, res) => {
  try {
    const { subjectId } = req.params;
    const userId = req.user.id;

    // Get subject basic info
    const [subjects] = await pool.query('SELECT is_free FROM subjects WHERE id = ?', [subjectId]);
    if (subjects.length === 0) return res.status(404).json({ message: 'Subject not found' });

    if (subjects[0].is_free) {
      return res.json({ access: true });
    }

    // Check enrollment
    const [enrollments] = await pool.query(
      'SELECT id FROM enrollments WHERE user_id = ? AND subject_id = ?',
      [userId, subjectId]
    );

    res.json({ access: enrollments.length > 0 });
  } catch (error) {
    console.error('Access check error:', error);
    res.status(500).json({ message: 'Server error during access check' });
  }
};
