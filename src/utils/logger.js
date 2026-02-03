/*
Logging utility that only shows debug messages in development
and provides consistent logging patterns across the application.
*/

const logger = {
  debug: (...args) => {
    if (process.env.NODE_ENV === "development") {
      console.log("[DEBUG]", ...args);
    }
  },
  
  info: (...args) => {
    console.info("[INFO]", ...args);
  },
  
  warn: (...args) => {
    console.warn("[WARN]", ...args);
  },
  
  error: (...args) => {
    console.error("[ERROR]", ...args);
  },
};

export default logger;
