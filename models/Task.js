const mongoose = require('mongoose');

const historySchema = new mongoose.Schema({
  status: {
    type: String,
    enum: ['pending', 'in_progress', 'completed', 'overdue'],
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

const taskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  status: {
    type: String,
    enum: ['pending', 'in_progress', 'completed', 'overdue'],
    default: 'pending'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  startDate: {
    type: Date,
    required: true
  },
  dueDate: {
    type: Date,
    required: true
  },
  dependsOn: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Task'
  }],
  history: [historySchema]
}, {
  timestamps: true
});

// Pre-save middleware to record status changes in history
taskSchema.pre('save', function(next) {
  const task = this;
  
  // If the task is new, add initial status to history
  if (task.isNew) {
    task.history = [{ status: task.status, timestamp: new Date() }];
  } else if (task.isModified('status')) {
    // If the status has changed, add to history
    task.history.push({ status: task.status, timestamp: new Date() });
  }
  
  next();
});

const Task = mongoose.model('Task', taskSchema);

module.exports = Task;