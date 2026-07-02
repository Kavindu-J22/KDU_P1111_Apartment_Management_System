const express = require('express');
const router = express.Router();
const {
  reserveFacility,
  getReservations,
  approveReservation
} = require('../controllers/facilityController');
const { verifyToken, authorizeRoles } = require('../middleware/authMiddleware');

router.post('/reserve', verifyToken, authorizeRoles('homeowner', 'tenant'), reserveFacility);
router.get('/reservations', verifyToken, getReservations);
router.put('/reservations/:id/approve', verifyToken, authorizeRoles('admin', 'staff'), approveReservation);

module.exports = router;
