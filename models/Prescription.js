const mongoose = require('mongoose');

const prescriptionSchema = new mongoose.Schema({
  docName: {
    type: String,
    required: true,
    trim: true
  },
  prescription: {
    type: String,
    required: true
  },
  patientName: {
    type: String,
    required: true,
    trim: true
  },
  mobile: {
    type: String,
    required: true,
    trim: true
  },
  startDate: {
    type: Date,
    required: true
  },
  dosage: [{
    type: String,
    enum: ['0.25mg', '0.5mg', '1.0mg', '1.7mg', '2.4mg']
  }],
  createdBy: {
    type: String,
    required: true,
    ref: 'User'
  },
  location: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Index for better query performance
prescriptionSchema.index({ createdBy: 1, startDate: 1 });
prescriptionSchema.index({ docName: 'text' });

module.exports = mongoose.model('Prescription', prescriptionSchema);