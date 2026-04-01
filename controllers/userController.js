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

// Add this new function to get user's own prescriptions with filters
const getUserPrescriptionsWithFilters = async (req, res) => {
  try {
    const { date, doctor, patient, startDate, endDate } = req.query;
    let filter = { createdBy: req.user.userId };

    // Date filter (created date)
    if (date) {
      const startDate = new Date(date);
      startDate.setHours(0, 0, 0, 0);
      const endDate = new Date(date);
      endDate.setHours(23, 59, 59, 999);
      filter.createdAt = { $gte: startDate, $lte: endDate };
    }

    // Start date filter (dosage start date)
    if (startDate) {
      filter.startDate = { $gte: new Date(startDate) };
    }
    if (endDate) {
      filter.startDate = { ...filter.startDate, $lte: new Date(endDate) };
    }

    // Doctor name search
    if (doctor) {
      filter.docName = { $regex: doctor, $options: 'i' };
    }

    // Patient name search
    if (patient) {
      filter.patientName = { $regex: patient, $options: 'i' };
    }

    const prescriptions = await Prescription.find(filter)
      .sort({ createdAt: -1 });
    
    res.json(prescriptions);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { 
  submitPrescription, 
  getUserPrescriptions,
  getUserPrescriptionsWithFilters
};