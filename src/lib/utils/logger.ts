// Enhanced Logger with File Output Support
// Structured logging with categories and file output in development mode

export enum LogLevel {
  ERROR = 0,
  WARN = 1,
  INFO = 2,
  DEBUG = 3
}

export enum LogCategory {
  PLAYER = 'PLAYER',
  STREAM = 'STREAM',
  ADDON = 'ADDON',
  NETWORK = 'NETWORK',
  UI = 'UI',
  PERFORMANCE = 'PERFORMANCE',
  SYSTEM = 'SYSTEM'
}

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  category: LogCategory;
  message: string;
  data?: any;
  stack?: string;
}

class Logger {
  private logLevel: LogLevel;
  private isDevelopment: boolean;
  private logBuffer: LogEntry[] = [];
  private maxBufferSize = 1000;
  private fileLoggingEnabled = false;

  constructor() {
    this.isDevelopment = import.meta.env.DEV;
    this.logLevel = this.isDevelopment ? LogLevel.DEBUG : LogLevel.INFO;
    this.fileLoggingEnabled = this.isDevelopment;
    
    // Initialize file logging in development
    if (this.fileLoggingEnabled) {
      this.initFileLogging();
    }
  }

  private initFileLogging() {
    // Create log endpoint for file writing
    this.setupLogEndpoint();
    
    // Flush buffer periodically
    setInterval(() => {
      this.flushToFile();
    }, 5000); // Flush every 5 seconds

    // Flush on page unload
    if (typeof window !== 'undefined') {
      window.addEventListener('beforeunload', () => {
        this.flushToFile();
      });
    }
  }

  private setupLogEndpoint() {
    // Check if we can write to the server's log endpoint
    if (typeof fetch !== 'undefined') {
      this.sendLogBatch = this.sendLogBatch.bind(this);
    }
  }

  private async sendLogBatch(logs: LogEntry[]) {
    if (!this.fileLoggingEnabled || logs.length === 0) return;

    try {
      await fetch('/api/logs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ logs })
      });
    } catch (error) {
      // Fallback to console if server logging fails
      console.warn('Failed to send logs to server:', error);
    }
  }

  private formatMessage(level: LogLevel, category: LogCategory, message: string, data?: any): string {
    const timestamp = new Date().toISOString();
    const levelStr = LogLevel[level].padEnd(5);
    const categoryStr = category.padEnd(11);
    
    let formattedMsg = `[${timestamp}] ${levelStr} ${categoryStr} ${message}`;
    
    if (data !== undefined) {
      if (typeof data === 'object') {
        formattedMsg += ` ${JSON.stringify(data, null, 2)}`;
      } else {
        formattedMsg += ` ${data}`;
      }
    }
    
    return formattedMsg;
  }

  private addToBuffer(entry: LogEntry) {
    this.logBuffer.push(entry);
    
    // Maintain buffer size
    if (this.logBuffer.length > this.maxBufferSize) {
      this.logBuffer = this.logBuffer.slice(-this.maxBufferSize);
    }
  }

  private flushToFile() {
    if (this.logBuffer.length === 0) return;
    
    const logsToSend = [...this.logBuffer];
    this.logBuffer = [];
    
    this.sendLogBatch(logsToSend);
  }

  private log(level: LogLevel, category: LogCategory, message: string, data?: any, error?: Error) {
    if (level > this.logLevel) return;

    const timestamp = new Date().toISOString();
    const entry: LogEntry = {
      timestamp,
      level,
      category,
      message,
      data,
      stack: error?.stack
    };

    // Console output
    const formattedMsg = this.formatMessage(level, category, message, data);
    
    switch (level) {
      case LogLevel.ERROR:
        console.error(formattedMsg);
        if (error) console.error(error.stack);
        break;
      case LogLevel.WARN:
        console.warn(formattedMsg);
        break;
      case LogLevel.INFO:
        console.info(formattedMsg);
        break;
      case LogLevel.DEBUG:
        console.debug(formattedMsg);
        break;
    }

    // Add to buffer for file logging
    if (this.fileLoggingEnabled) {
      this.addToBuffer(entry);
    }
  }

  // Public logging methods
  error(category: LogCategory, message: string, data?: any, error?: Error) {
    this.log(LogLevel.ERROR, category, message, data, error);
  }

  warn(category: LogCategory, message: string, data?: any) {
    this.log(LogLevel.WARN, category, message, data);
  }

  info(category: LogCategory, message: string, data?: any) {
    this.log(LogLevel.INFO, category, message, data);
  }

  debug(category: LogCategory, message: string, data?: any) {
    this.log(LogLevel.DEBUG, category, message, data);
  }

  // Performance timing helpers
  time(label: string, category: LogCategory = LogCategory.PERFORMANCE) {
    if (typeof performance !== 'undefined') {
      performance.mark(`${label}-start`);
      this.debug(category, `Timer started: ${label}`);
    }
  }

  timeEnd(label: string, category: LogCategory = LogCategory.PERFORMANCE) {
    if (typeof performance !== 'undefined') {
      try {
        performance.mark(`${label}-end`);
        performance.measure(label, `${label}-start`, `${label}-end`);
        
        const measure = performance.getEntriesByName(label)[0];
        const duration = Math.round(measure.duration * 100) / 100;
        
        this.info(category, `Timer ${label}: ${duration}ms`);
        
        // Cleanup
        performance.clearMarks(`${label}-start`);
        performance.clearMarks(`${label}-end`);
        performance.clearMeasures(label);
        
        return duration;
      } catch (error) {
        this.warn(category, `Timer ${label} failed`, error);
      }
    }
    return 0;
  }

  // Get recent logs for debugging
  getRecentLogs(count: number = 100): LogEntry[] {
    return this.logBuffer.slice(-count);
  }

  // Force flush logs to file
  flush() {
    this.flushToFile();
  }
}

// Create singleton instance
export const logger = new Logger();

// Export convenience functions for easier usage
export const logError = (category: LogCategory, message: string, data?: any, error?: Error) => 
  logger.error(category, message, data, error);

export const logWarn = (category: LogCategory, message: string, data?: any) => 
  logger.warn(category, message, data);

export const logInfo = (category: LogCategory, message: string, data?: any) => 
  logger.info(category, message, data);

export const logDebug = (category: LogCategory, message: string, data?: any) => 
  logger.debug(category, message, data);

export const logTime = (label: string, category?: LogCategory) => 
  logger.time(label, category);

export const logTimeEnd = (label: string, category?: LogCategory) => 
  logger.timeEnd(label, category);