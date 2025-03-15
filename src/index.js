import app from "./app.js";
import { PORT } from "./config/index.js";
import { connectDB } from "./db/dbMaster.js";
import logger from "./utils/logger.js";

process.on("uncaughtException", (error) => {
  logger.error("❌ Uncaught Exception:", error);
  process.exit(1);
});

process.on("unhandledRejection", (error) => {
  logger.error("❌ Unhandled Promise Rejection:", error);
});

connectDB()
  .then(() => {
    app.listen(PORT, () => {
      logger.debug(`🚀 Server is running at port: ${PORT}`);
    });
  })
  .catch((error) => {
    logger.error(`❌ MongoDB connection failed: ${error}`);
  });
