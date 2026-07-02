const pool = require('../config/db');

// @desc    Publish a new notice
// @route   POST /api/notices
// @access  Private (Admin / Staff)
const createNotice = async (req, res) => {
  const { title, content } = req.body;
  const userId = req.user.id;

  try {
    if (!title || !content) {
      return res.status(400).json({ message: 'Title and content are required.' });
    }

    const [result] = await pool.query(
      'INSERT INTO notices (title, content, created_by) VALUES (?, ?, ?)',
      [title, content, userId]
    );

    return res.status(201).json({
      message: 'Notice published successfully.',
      noticeId: result.insertId
    });
  } catch (error) {
    console.error('Create notice error:', error);
    return res.status(500).json({ message: 'Internal server error.' });
  }
};

// @desc    Get all notices
// @route   GET /api/notices
// @access  Private (All Roles)
const getNotices = async (req, res) => {
  try {
    const [notices] = await pool.query(`
      SELECT n.*, u.email AS author_email
      FROM notices n
      JOIN users u ON n.created_by = u.id
      ORDER BY n.created_at DESC
    `);
    return res.status(200).json(notices);
  } catch (error) {
    console.error('Get notices error:', error);
    return res.status(500).json({ message: 'Internal server error.' });
  }
};

module.exports = {
  createNotice,
  getNotices
};
