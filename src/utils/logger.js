import winston from "winston";
import path from "path";
import fs from "fs";

// Ensure the logs directory exists
const logDir = path.join(process.cwd(), "logs");
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir);
}

// Define Winston transports with filtering
const logger = winston.createLogger({
  level: "info", // Default logging level
  format: winston.format.combine(
    winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    winston.format.printf(({ timestamp, level, message }) => {
      return `[${timestamp}] ${level.toUpperCase()}: ${message}`;
    })
  ),
  transports: [
    // ✅ Console Logging (Only shows warnings & errors)
    new winston.transports.Console({
      level: "warn", // Filters out everything below 'warn'
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      ),
    }),

    // ✅ General logs (Info and above, excludes debug)
    new winston.transports.File({
      filename: path.join(logDir, "app.log"),
      level: "info", // Logs only 'info' and higher
    }),

    // ✅ Error logs (Only errors)
    new winston.transports.File({
      filename: path.join(logDir, "error.log"),
      level: "error", // Logs only 'error'
    }),

    // ✅ Debug logs (Only for debugging, separate file)
    new winston.transports.File({
      filename: path.join(logDir, "debug.log"),
      level: "debug", // Logs only 'debug'
    }),
  ],
});

export default logger;
