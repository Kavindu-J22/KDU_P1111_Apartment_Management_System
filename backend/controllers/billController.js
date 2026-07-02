const pool = require('../config/db');

// Helper to get unit ID for a resident
async function getResidentUnitId(userId, role) {
  let query = '';
  if (role === 'homeowner') {
    query = 'SELECT id FROM units WHERE owner_id = ?';
  } else if (role === 'tenant') {
    query = 'SELECT id FROM units WHERE tenant_id = ?';
  } else {
    return null;
  }
  const [units] = await pool.query(query, [userId]);
  return units.length > 0 ? units[0].id : null;
}

// @desc    Create a bill for a unit
// @route   POST /api/bills
// @access  Private (Admin / Staff)
const createBill = async (req, res) => {
  const { unit_id, amount, description, due_date } = req.body;

  try {
    if (!unit_id || !amount || !description || !due_date) {
      return res.status(400).json({ message: 'All fields are required.' });
    }

    // Verify unit exists
    const [unit] = await pool.query('SELECT id FROM units WHERE id = ?', [unit_id]);
    if (unit.length === 0) {
      return res.status(404).json({ message: 'Unit not found.' });
    }

    const [result] = await pool.query(
      'INSERT INTO bills (unit_id, amount, description, due_date, status) VALUES (?, ?, ?, ?, "unpaid")',
      [unit_id, amount, description, due_date]
    );

    return res.status(201).json({
      message: 'Bill created successfully.',
      billId: result.insertId
    });
  } catch (error) {
    console.error('Create bill error:', error);
    return res.status(500).json({ message: 'Internal server error.' });
  }
};

// @desc    Get bills list based on role
// @route   GET /api/bills
// @access  Private
const getBills = async (req, res) => {
  const { id: userId, role } = req.user;

  try {
    let query = '';
    let params = [];

    if (role === 'admin' || role === 'staff') {
      // Admin/Staff see all bills
      query = `
        SELECT b.*, u.block_name, u.floor_number, u.unit_number 
        FROM bills b
        JOIN units u ON b.unit_id = u.id
        ORDER BY b.due_date DESC
      `;
    } else {
      // Residents see bills for their specific unit
      const unitId = await getResidentUnitId(userId, role);
      if (!unitId) {
        return res.status(200).json([]); // No unit, no bills
      }

      query = `
        SELECT * FROM bills 
        WHERE unit_id = ? 
        ORDER BY due_date DESC
      `;
      params = [unitId];
    }

    const [bills] = await pool.query(query, params);
    return res.status(200).json(bills);
  } catch (error) {
    console.error('Get bills error:', error);
    return res.status(500).json({ message: 'Internal server error.' });
  }
};

// @desc    Pay a bill
// @route   PUT /api/bills/:id/pay
// @access  Private (Homeowner / Tenant)
const payBill = async (req, res) => {
  const { id } = req.params;
  const { id: userId, role } = req.user;

  try {
    // 1. Fetch bill
    const [bill] = await pool.query('SELECT * FROM bills WHERE id = ?', [id]);
    if (bill.length === 0) {
      return res.status(404).json({ message: 'Bill not found.' });
    }

    const targetBill = bill[0];

    // 2. Verify that resident owns the unit that has the bill
    const unitId = await getResidentUnitId(userId, role);
    if (!unitId || targetBill.unit_id !== unitId) {
      return res.status(403).json({ message: 'You do not have permission to pay this bill.' });
    }

    if (targetBill.status === 'paid') {
      return res.status(400).json({ message: 'This bill is already paid.' });
    }

    // 3. Update status to paid
    await pool.query('UPDATE bills SET status = "paid" WHERE id = ?', [id]);

    return res.status(200).json({ message: 'Bill marked as paid successfully.' });
  } catch (error) {
    console.error('Pay bill error:', error);
    return res.status(500).json({ message: 'Internal server error.' });
  }
};

module.exports = {
  createBill,
  getBills,
  payBill
};
