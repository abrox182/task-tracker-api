class Logger {
    constructor() {
      this.levels = {
        error: 0,
        warn: 1,
        info: 2,
        debug: 3
      };
      
      // Set default log level based on environment
      this.level = process.env.LOG_LEVEL || (process.env.NODE_ENV === 'production' ? 'info' : 'debug');
    }
    
    setLevel(level) {
      if (this.levels[level] !== undefined) {
        this.level = level;
      }
    }
    
    _shouldLog(level) {
      return this.levels[level] <= this.levels[this.level];
    }
    
    _formatMessage(level, message, ...args) {
      const timestamp = new Date().toISOString();
      let formattedMessage = `[${timestamp}] [${level.toUpperCase()}] ${message}`;
      
      if (args.length > 0) {
        args.forEach(arg => {
          if (typeof arg === 'object') {
            formattedMessage += ' ' + JSON.stringify(arg);
          } else {
            formattedMessage += ' ' + arg;
          }
        });
      }
      
      return formattedMessage;
    }
    
    error(message, ...args) {
      if (this._shouldLog('error')) {
        console.error(this._formatMessage('error', message, ...args));
      }
    }
    
    warn(message, ...args) {
      if (this._shouldLog('warn')) {
        console.warn(this._formatMessage('warn', message, ...args));
      }
    }
    
    info(message, ...args) {
      if (this._shouldLog('info')) {
        console.info(this._formatMessage('info', message, ...args));
      }
    }
    
    debug(message, ...args) {
      if (this._shouldLog('debug')) {
        console.debug(this._formatMessage('debug', message, ...args));
      }
    }
  }
  
  module.exports = new Logger();
  