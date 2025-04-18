const logger = require('../utils/logger');

/**
 * Mock notification service that logs notifications to the console
 * In a real app, this would send emails, push notifications, etc.
 */
exports.sendNotification = (eventType, data) => {
  switch (eventType) {
    case 'TASK_CREATED':
      logger.info(`NOTIFICATION: New task created - "${data.title}" (ID: ${data._id})`);
      break;
    
    case 'TASK_STATUS_CHANGED':
      logger.info(`NOTIFICATION: Task ID ${data.taskId} status changed from ${data.oldStatus} to ${data.newStatus}`);
      break;
    
    case 'TASK_OVERDUE':
      logger.warn(`NOTIFICATION: Task "${data.title}" (ID: ${data._id}) is now overdue!`);
      break;
    
    case 'TASK_DELETED':
      logger.info(`NOTIFICATION: Task ID ${data.taskId} has been deleted`);
      break;
    
    default:
      logger.info(`NOTIFICATION: ${eventType}`, data);
  }
};
