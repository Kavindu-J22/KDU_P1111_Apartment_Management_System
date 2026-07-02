const express = require('express');
const router = express.Router();
const {
  register,
  login,
  getPendingApprovals,
  approveUser,
  getApprovedHomeowners,
  getAdminDashboardStats,
  getApprovedResidents,
  getResidentDashboardStats,
  updateProfile
} = require('../controllers/authController');
const { verifyToken } = require('../middleware/authMiddleware');

router.post('/register', register);
router.post('/login', login);
router.get('/homeowners', getApprovedHomeowners);
router.get('/pending-approvals', verifyToken, getPendingApprovals);
router.post('/approve', verifyToken, approveUser);
router.get('/admin-dashboard-stats', verifyToken, getAdminDashboardStats);
router.get('/residents', verifyToken, getApprovedResidents);
router.get('/resident-dashboard-stats', verifyToken, getResidentDashboardStats);
router.put('/profile', verifyToken, updateProfile);

module.exports = router;
