const cron = require('node-cron');
const taskService = require('../services/taskService');
const notificationService = require('../services/notificationService');
const logger = require('./logger');

/**
 * Initialize all scheduled jobs for the application
 */
exports.initScheduledJobs = () => {
  // Check for overdue tasks every hour
  cron.schedule('0 * * * *', async () => {
    logger.info('Running scheduled job: Check for overdue tasks');
    
    try {
      const overdueTasks = await taskService.markOverdueTasks();
      
      // Send notifications for each overdue task
      overdueTasks.forEach(task => {
        notificationService.sendNotification('TASK_OVERDUE', task);
      });
      
      logger.info(`Overdue check completed. ${overdueTasks.length} tasks marked as overdue.`);
    } catch (error) {
      logger.error('Error in overdue tasks scheduled job:', error);
    }
  });
  
  logger.info('Scheduled jobs initialized');
};