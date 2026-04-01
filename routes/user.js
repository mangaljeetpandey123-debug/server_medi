const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const { submitPrescription, getUserPrescriptions } = require('../controllers/userController');

router.use(authenticateToken);

router.post('/data', submitPrescription);
router.get('/my-prescriptions', getUserPrescriptions);

module.exports = router;