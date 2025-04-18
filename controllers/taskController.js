const taskService = require('../services/taskService');
const notificationService = require('../services/notificationService');
const logger = require('../utils/logger');

exports.getAllTasks = async (req, res) => {
  try {
    const tasks = await taskService.getAllTasks();
    res.json(tasks);
  } catch (error) {
    logger.error('Error in getAllTasks:', error);
    res.status(500).json({ error: 'Failed to retrieve tasks' });
  }
};

exports.getTaskById = async (req, res) => {
  try {
    const task = await taskService.getTaskById(req.params.id);
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }
    res.json(task);
  } catch (error) {
    logger.error(`Error in getTaskById for ID ${req.params.id}:`, error);
    res.status(500).json({ error: 'Failed to retrieve task' });
  }
};

exports.createTask = async (req, res) => {
  try {
    const task = await taskService.createTask(req.body);
    notificationService.sendNotification('TASK_CREATED', task);
    res.status(201).json(task);
  } catch (error) {
    logger.error('Error in createTask:', error);
    res.status(400).json({ error: error.message || 'Failed to create task' });
  }
};

exports.updateTask = async (req, res) => {
  try {
    const originalTask = await taskService.getTaskById(req.params.id);
    if (!originalTask) {
      return res.status(404).json({ error: 'Task not found' });
    }
    
    // Check if we can update the status based on dependencies
    if (req.body.status && req.body.status === 'in_progress') {
      const canUpdateStatus = await taskService.canMoveToInProgress(req.params.id);
      if (!canUpdateStatus) {
        return res.status(400).json({ 
          error: 'Cannot move task to in_progress until all dependent tasks are completed' 
        });
      }
    }
    
    const updatedTask = await taskService.updateTask(req.params.id, req.body);
    
    // Send notification if status has changed
    if (originalTask.status !== updatedTask.status) {
      notificationService.sendNotification('TASK_STATUS_CHANGED', {
        taskId: updatedTask._id,
        oldStatus: originalTask.status,
        newStatus: updatedTask.status
      });
    }
    
    res.json(updatedTask);
  } catch (error) {
    logger.error(`Error in updateTask for ID ${req.params.id}:`, error);
    res.status(400).json({ error: error.message || 'Failed to update task' });
  }
};

exports.deleteTask = async (req, res) => {
  try {
    const task = await taskService.getTaskById(req.params.id);
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }
    
    // Check if this task is a dependency for other tasks
    const isADependency = await taskService.isTaskADependency(req.params.id);
    if (isADependency) {
      return res.status(400).json({ 
        error: 'This task cannot be deleted as it is a dependency for other tasks' 
      });
    }
    
    await taskService.deleteTask(req.params.id);
    notificationService.sendNotification('TASK_DELETED', { taskId: req.params.id });
    res.status(200).json({ message: 'Task deleted successfully' });
  } catch (error) {
    logger.error(`Error in deleteTask for ID ${req.params.id}:`, error);
    res.status(500).json({ error: 'Failed to delete task' });
  }
};

exports.getTasksByPriority = async (req, res) => {
  try {
    const tasks = await taskService.getTasksByPriority();
    res.json(tasks);
  } catch (error) {
    logger.error('Error in getTasksByPriority:', error);
    res.status(500).json({ error: 'Failed to retrieve tasks by priority' });
  }
};

exports.getOverdueTasks = async (req, res) => {
  try {
    const tasks = await taskService.getOverdueTasks();
    res.json(tasks);
  } catch (error) {
    logger.error('Error in getOverdueTasks:', error);
    res.status(500).json({ error: 'Failed to retrieve overdue tasks' });
  }
};
