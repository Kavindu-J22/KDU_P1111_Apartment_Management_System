const pool = require('../config/db');

// @desc    Submit a complaint
// @route   POST /api/complaints
// @access  Private (Homeowner / Tenant)
const submitComplaint = async (req, res) => {
  const { category, description, priority } = req.body;
  const userId = req.user.id;

  try {
    if (!category || !description || !priority) {
      return res.status(400).json({ message: 'All fields are required.' });
    }

    if (!['low', 'medium', 'high'].includes(priority)) {
      return res.status(400).json({ message: 'Invalid priority level.' });
    }

    const [result] = await pool.query(
      'INSERT INTO complaints (user_id, category, description, priority, status) VALUES (?, ?, ?, ?, ?)',
      [userId, category, description, priority, 'pending']
    );

    return res.status(201).json({
      message: 'Complaint submitted successfully.',
      complaintId: result.insertId
    });
  } catch (error) {
    console.error('Submit complaint error:', error);
    return res.status(500).json({ message: 'Internal server error.' });
  }
};

// @desc    Get complaints based on user role
// @route   GET /api/complaints
// @access  Private (All Roles)
const getComplaints = async (req, res) => {
  const { id: userId, role } = req.user;

  try {
    let query = '';
    let params = [];

    if (role === 'admin' || role === 'staff') {
      // Admins and Staff see all complaints
      query = `
        SELECT c.*, u.email AS resident_email, staff.email AS assigned_staff_email
        FROM complaints c
        JOIN users u ON c.user_id = u.id
        LEFT JOIN users staff ON c.assigned_staff_id = staff.id
        ORDER BY c.created_at DESC
      `;
    } else if (role === 'maintenance') {
      // Maintenance Staff see all complaints, prioritized
      query = `
        SELECT c.*, u.email AS resident_email, staff.email AS assigned_staff_email
        FROM complaints c
        JOIN users u ON c.user_id = u.id
        LEFT JOIN users staff ON c.assigned_staff_id = staff.id
        ORDER BY 
          CASE c.priority 
            WHEN 'high' THEN 1 
            WHEN 'medium' THEN 2 
            WHEN 'low' THEN 3 
          END ASC, 
          c.created_at DESC
      `;
    } else {
      // Homeowners/Tenants see only their own complaints
      query = `
        SELECT c.*, staff.email AS assigned_staff_email
        FROM complaints c
        LEFT JOIN users staff ON c.assigned_staff_id = staff.id
        WHERE c.user_id = ?
        ORDER BY c.created_at DESC
      `;
      params = [userId];
    }

    const [complaints] = await pool.query(query, params);
    return res.status(200).json(complaints);
  } catch (error) {
    console.error('Get complaints error:', error);
    return res.status(500).json({ message: 'Internal server error.' });
  }
};

// @desc    Update complaint status
// @route   PUT /api/complaints/:id/status
// @access  Private (Admin / Staff / Maintenance)
const updateComplaintStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  try {
    if (!status || !['pending', 'in_progress', 'resolved'].includes(status)) {
      return res.status(400).json({ message: 'Invalid or missing status.' });
    }

    // Verify complaint exists
    const [existing] = await pool.query('SELECT * FROM complaints WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ message: 'Complaint not found.' });
    }

    await pool.query('UPDATE complaints SET status = ? WHERE id = ?', [status, id]);
    return res.status(200).json({ message: 'Complaint status updated successfully.' });
  } catch (error) {
    console.error('Update complaint status error:', error);
    return res.status(500).json({ message: 'Internal server error.' });
  }
};

// @desc    Assign complaint to a staff member
// @route   PUT /api/complaints/:id/assign
// @access  Private (Admin / Staff)
const assignComplaint = async (req, res) => {
  const { id } = req.params;
  const { assigned_staff_id } = req.body;

  try {
    if (!assigned_staff_id) {
      return res.status(400).json({ message: 'Staff ID is required.' });
    }

    // Verify complaint exists
    const [existing] = await pool.query('SELECT * FROM complaints WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ message: 'Complaint not found.' });
    }

    // Verify assigned user is staff or maintenance
    const [staff] = await pool.query('SELECT role FROM users WHERE id = ?', [assigned_staff_id]);
    if (staff.length === 0 || !['staff', 'maintenance'].includes(staff[0].role)) {
      return res.status(400).json({ message: 'Assigned user must be a valid staff or maintenance worker.' });
    }

    await pool.query('UPDATE complaints SET assigned_staff_id = ? WHERE id = ?', [assigned_staff_id, id]);
    return res.status(200).json({ message: 'Complaint assigned successfully.' });
  } catch (error) {
    console.error('Assign complaint error:', error);
    return res.status(500).json({ message: 'Internal server error.' });
  }
};

module.exports = {
  submitComplaint,
  getComplaints,
  updateComplaintStatus,
  assignComplaint
};
