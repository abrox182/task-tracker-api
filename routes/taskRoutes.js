const express = require('express');
const taskController = require('../controllers/taskController');
const { validateTask } = require('../middleware/validation');
const { cacheMiddleware, clearCache } = require('../middleware/cache');

const router = express.Router();

// Get all tasks (with caching)
router.get('/', cacheMiddleware('allTasks'), taskController.getAllTasks);

// Get task by ID
router.get('/:id', taskController.getTaskById);

// Create a new task
router.post('/', validateTask, clearCache('allTasks'), taskController.createTask);

// Update a task
router.put('/:id', validateTask, clearCache('allTasks'), taskController.updateTask);

// Delete a task
router.delete('/:id', clearCache('allTasks'), taskController.deleteTask);

// Get tasks by priority (sorted)
router.get('/sort/priority', taskController.getTasksByPriority);

// Get overdue tasks
router.get('/filter/overdue', taskController.getOverdueTasks);

module.exports = router;