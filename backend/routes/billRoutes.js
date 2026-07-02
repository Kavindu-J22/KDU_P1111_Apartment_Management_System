const express = require('express');
const router = express.Router();
const { createBill, getBills, payBill } = require('../controllers/billController');
const { verifyToken, authorizeRoles } = require('../middleware/authMiddleware');

router.post('/', verifyToken, authorizeRoles('admin', 'staff'), createBill);
router.get('/', verifyToken, getBills);
router.put('/:id/pay', verifyToken, authorizeRoles('homeowner', 'tenant'), payBill);

module.exports = router;
