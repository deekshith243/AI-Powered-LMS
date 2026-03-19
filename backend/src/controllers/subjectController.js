const SubjectService = require('../services/subjectService');

exports.getSubjects = async (req, res) => {
  try {
    const { type } = req.query;
    const subjects = await SubjectService.getAllSubjects(type);
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
