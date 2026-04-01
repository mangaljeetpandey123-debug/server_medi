const Prescription = require('../models/Prescription');

const submitPrescription = async (req, res) => {
  try {
    const { docName, prescription, patientName, mobile, startDate, dosage } = req.body;
    const { userId, location } = req.user;

    const newPrescription = new Prescription({
      docName,
      prescription,
      patientName,
      mobile,
      startDate,
      dosage,
      createdBy: userId,
      location
    });

    await newPrescription.save();
    res.status(201).json({ message: 'Prescription submitted successfully', data: newPrescription });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getUserPrescriptions = async (req, res) => {
  try {
    const prescriptions = await Prescription.find({ createdBy: req.user.userId })
      .sort({ createdAt: -1 });
    res.json(prescriptions);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { submitPrescription, getUserPrescriptions };