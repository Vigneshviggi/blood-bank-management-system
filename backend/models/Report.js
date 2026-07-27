const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
  title: { type: String, required: true },
  type: { 
    type: String, 
    enum: ['Monthly Donations', 'Blood Requests', 'Camp Attendance', 'Hospital Statistics', 'Blood Bank Inventory', 'System Audit'],
    required: true 
  },
  generatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  parameters: { type: mongoose.Schema.Types.Mixed },
  format: { type: String, enum: ['PDF', 'Excel', 'JSON'], default: 'PDF' },
  fileUrl: { type: String },
  status: { type: String, enum: ['Generated', 'Failed', 'Pending'], default: 'Generated' }
}, { timestamps: true });

module.exports = mongoose.model('Report', reportSchema);
