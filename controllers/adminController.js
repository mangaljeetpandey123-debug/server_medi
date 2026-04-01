const User = require('../models/User');
const Prescription = require('../models/Prescription');
const bcrypt = require('bcryptjs');

// Create new user (MExecutive)
const createUser = async (req, res) => {
  try {
    const { userId, password, location } = req.body;

    const existingUser = await User.findOne({ userId });
    if (existingUser) {
      return res.status(400).json({ message: 'User ID already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({
      userId,
      password: hashedPassword,
      role: 'MExecutive',
      location
    });

    await user.save();
    res.status(201).json({ message: 'User created successfully', user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get all users (MExecutives only)
const getUsers = async (req, res) => {
  try {
    const users = await User.find({ role: 'MExecutive' })
      .select('-password')
      .sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get single user by ID
const getUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findOne({ userId }).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Edit user
const editUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const { password, location } = req.body;

    // Check if user exists
    const user = await User.findOne({ userId });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update user
    const updateData = {};
    if (location) updateData.location = location;
    if (password && password.trim() !== '') {
      updateData.password = await bcrypt.hash(password, 10);
    }

    const updatedUser = await User.findOneAndUpdate(
      { userId },
      updateData,
      { new: true }
    ).select('-password');

    res.json({ message: 'User updated successfully', user: updatedUser });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete user
const deleteUser = async (req, res) => {
  try {
    const { userId } = req.params;

    // Check if user exists
    const user = await User.findOne({ userId });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if trying to delete admin
    if (user.role === 'admin') {
      return res.status(403).json({ message: 'Cannot delete admin user' });
    }

    // Delete all prescriptions associated with this user
    const deleteResult = await Prescription.deleteMany({ createdBy: userId });
    console.log(`Deleted ${deleteResult.deletedCount} prescriptions for user ${userId}`);

    // Delete the user
    await User.findOneAndDelete({ userId });

    res.json({ 
      message: 'User deleted successfully',
      deletedPrescriptions: deleteResult.deletedCount 
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get all prescription data with filters
const getData = async (req, res) => {
  try {
    const { date, doctor, location, createdBy } = req.query;
    let filter = {};

    // Date filter
    if (date) {
      const startDate = new Date(date);
      startDate.setHours(0, 0, 0, 0);
      const endDate = new Date(date);
      endDate.setHours(23, 59, 59, 999);
      filter.startDate = { $gte: startDate, $lte: endDate };
    }

    // Doctor name search
    if (doctor) {
      filter.docName = { $regex: doctor, $options: 'i' };
    }

    // Location search
    if (location) {
      filter.location = { $regex: location, $options: 'i' };
    }

    // Agent filter
    if (createdBy) {
      filter.createdBy = createdBy;
    }

    const prescriptions = await Prescription.find(filter)
      .sort({ createdAt: -1 });
    
    res.json(prescriptions);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get dashboard statistics
const getDashboardStats = async (req, res) => {
  try {
    const totalAgents = await User.countDocuments({ role: 'MExecutive' });
    const totalEntries = await Prescription.countDocuments();
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const todayEntries = await Prescription.countDocuments({
      createdAt: { $gte: today, $lt: tomorrow }
    });

    // Agent-wise reports
    const agentReports = await Prescription.aggregate([
      {
        $group: {
          _id: '$createdBy',
          totalPrescriptions: { $sum: 1 },
          uniquePatients: { $addToSet: '$patientName' }
        }
      },
      {
        $project: {
          agentId: '$_id',
          totalPrescriptions: 1,
          uniquePatientsCount: { $size: '$uniquePatients' }
        }
      }
    ]);

    res.json({
      totalAgents,
      totalEntries,
      todayEntries,
      agentReports
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { 
  createUser, 
  getUsers, 
  getUser,
  getData, 
  getDashboardStats,
  editUser,
  deleteUser
};