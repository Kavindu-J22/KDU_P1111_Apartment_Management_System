const pool = require('../config/db');

// @desc    Request a facility reservation
// @route   POST /api/facilities/reserve
// @access  Private (Homeowner / Tenant)
const reserveFacility = async (req, res) => {
  const { facility_name, date } = req.body;
  const userId = req.user.id;

  try {
    if (!facility_name || !date) {
      return res.status(400).json({ message: 'Facility name and date are required.' });
    }

    // Check if the facility is already booked and approved on this date
    const [alreadyBooked] = await pool.query(
      'SELECT id FROM facility_reservations WHERE facility_name = ? AND date = ? AND status = "approved"',
      [facility_name, date]
    );

    if (alreadyBooked.length > 0) {
      return res.status(400).json({ message: 'This facility is already reserved and approved for this date.' });
    }

    // Insert reservation request (pending by default)
    const [result] = await pool.query(
      'INSERT INTO facility_reservations (user_id, facility_name, date, status) VALUES (?, ?, ?, ?)',
      [userId, facility_name, date, 'pending']
    );

    return res.status(201).json({
      message: 'Facility reservation requested successfully.',
      reservationId: result.insertId
    });
  } catch (error) {
    console.error('Reserve facility error:', error);
    return res.status(500).json({ message: 'Internal server error.' });
  }
};

// @desc    Get reservations list based on role
// @route   GET /api/facilities/reservations
// @access  Private (All Roles)
const getReservations = async (req, res) => {
  const { id: userId, role } = req.user;

  try {
    let query = '';
    let params = [];

    if (role === 'admin' || role === 'staff') {
      // Admin/Staff see all reservations
      query = `
        SELECT r.*, u.email AS resident_email 
        FROM facility_reservations r
        JOIN users u ON r.user_id = u.id
        ORDER BY r.date DESC
      `;
    } else {
      // Residents see only their own reservations
      query = `
        SELECT * FROM facility_reservations 
        WHERE user_id = ? 
        ORDER BY date DESC
      `;
      params = [userId];
    }

    const [reservations] = await pool.query(query, params);
    return res.status(200).json(reservations);
  } catch (error) {
    console.error('Get reservations error:', error);
    return res.status(500).json({ message: 'Internal server error.' });
  }
};

// @desc    Approve or reject a reservation
// @route   PUT /api/facilities/reservations/:id/approve
// @access  Private (Admin / Staff)
const approveReservation = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body; // 'approved' or 'rejected'

  try {
    if (!status || !['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Valid status (approved/rejected) is required.' });
    }

    // Check if reservation exists
    const [reservation] = await pool.query('SELECT * FROM facility_reservations WHERE id = ?', [id]);
    if (reservation.length === 0) {
      return res.status(404).json({ message: 'Reservation not found.' });
    }

    const targetReservation = reservation[0];

    if (status === 'approved') {
      // Make sure there is no already approved booking on that date
      const [alreadyBooked] = await pool.query(
        'SELECT id FROM facility_reservations WHERE facility_name = ? AND date = ? AND status = "approved" AND id != ?',
        [targetReservation.facility_name, targetReservation.date, id]
      );

      if (alreadyBooked.length > 0) {
        return res.status(400).json({ message: 'Cannot approve. Another request is already approved for this date.' });
      }

      // Approve this one
      await pool.query('UPDATE facility_reservations SET status = "approved" WHERE id = ?', [id]);

      // Automatically reject all other pending requests for the same facility on the same date!
      await pool.query(
        'UPDATE facility_reservations SET status = "rejected" WHERE facility_name = ? AND date = ? AND status = "pending" AND id != ?',
        [targetReservation.facility_name, targetReservation.date, id]
      );
    } else {
      // Just reject
      await pool.query('UPDATE facility_reservations SET status = "rejected" WHERE id = ?', [id]);
    }

    return res.status(200).json({ message: `Reservation has been ${status}.` });
  } catch (error) {
    console.error('Approve reservation error:', error);
    return res.status(500).json({ message: 'Internal server error.' });
  }
};

module.exports = {
  reserveFacility,
  getReservations,
  approveReservation
};
