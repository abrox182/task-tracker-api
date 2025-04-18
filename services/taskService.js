const Task = require('../models/Task');
const logger = require('../utils/logger');

exports.getAllTasks = async () => {
  return await Task.find().populate('dependsOn', 'title status');
};

exports.getTaskById = async (taskId) => {
  return await Task.findById(taskId).populate('dependsOn', 'title status');
};

exports.createTask = async (taskData) => {
  // Validate dates
  if (new Date(taskData.startDate) > new Date(taskData.dueDate)) {
    throw new Error('Start date cannot be after due date');
  }
  
  // Create the task
  const task = new Task(taskData);
  return await task.save();
};

exports.updateTask = async (taskId, updateData) => {
  // Validate dates if they're being updated
  if (updateData.startDate && updateData.dueDate) {
    if (new Date(updateData.startDate) > new Date(updateData.dueDate)) {
      throw new Error('Start date cannot be after due date');
    }
  }
  
  // Perform the update and return the updated document
  return await Task.findByIdAndUpdate(
    taskId,
    updateData,
    { new: true, runValidators: true }
  ).populate('dependsOn', 'title status');
};

exports.deleteTask = async (taskId) => {
  return await Task.findByIdAndDelete(taskId);
};

exports.canMoveToInProgress = async (taskId) => {
  const task = await Task.findById(taskId).populate('dependsOn');
  
  // If there are no dependencies, the task can move to in_progress
  if (!task.dependsOn || task.dependsOn.length === 0) {
    return true;
  }
  
  // Check if all dependencies are completed
  const incompleteDependencies = task.dependsOn.filter(
    dep => dep.status !== 'completed'
  );
  
  return incompleteDependencies.length === 0;
};

exports.isTaskADependency = async (taskId) => {
  const tasksDependingOnThis = await Task.countDocuments({ 
    dependsOn: taskId 
  });
  
  return tasksDependingOnThis > 0;
};

exports.getTasksByPriority = async () => {
  // Sort tasks by priority: high -> medium -> low
  const priorityOrder = { high: 1, medium: 2, low: 3 };
  
  return await Task.find()
    .sort({ 
      // Custom sort by priority
      priority: (a, b) => priorityOrder[a] - priorityOrder[b],
      // Secondary sort by due date
      dueDate: 1
    })
    .populate('dependsOn', 'title status');
};

exports.getOverdueTasks = async () => {
  const now = new Date();
  
  return await Task.find({
    dueDate: { $lt: now },
    status: { $ne: 'completed' }
  }).populate('dependsOn', 'title status');
};

exports.markOverdueTasks = async () => {
  const now = new Date();
  
  // Find tasks that are overdue but not marked as overdue yet
  const overdueTasksToUpdate = await Task.find({
    dueDate: { $lt: now },
    status: { $nin: ['completed', 'overdue'] }
  });
  
  logger.info(`Found ${overdueTasksToUpdate.length} tasks to mark as overdue`);
  
  // Update each task's status to 'overdue'
  for (const task of overdueTasksToUpdate) {
    task.status = 'overdue';
    await task.save();
    
    logger.info(`Task "${task.title}" (ID: ${task._id}) marked as overdue`);
  }
  
  return overdueTasksToUpdate;
};
