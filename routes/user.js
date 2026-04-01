const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const { 
  submitPrescription, 
  getUserPrescriptions,
  getUserPrescriptionsWithFilters
} = require('../controllers/userController');

router.use(authenticateToken);

router.post('/data', submitPrescription);
router.get('/my-prescriptions', getUserPrescriptions);
router.get('/my-prescriptions/filter', getUserPrescriptionsWithFilters);

module.exports = router;