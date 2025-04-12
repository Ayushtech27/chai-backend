import app from "./app.js";
import { PORT } from "./config/index.js";
import db from "./db/dbMaster.js";
import logger from "./utils/logger.js";

process.on("uncaughtException", async (error) => {
  logger.error("❌ Uncaught Exception:", error);
  await shutdownGracefully();
  process.exit(1);
});

process.on("unhandledRejection", async (reason) => {
  logger.error("❌ Unhandled Promise Rejection:", reason);
  await shutdownGracefully();
  process.exit(1);
});

db.once("connected", () => {
  app.listen(PORT, () => {
    logger.debug(`🚀 Server is running at port: ${PORT}`);
  });
});

db.on("error", (error) => {
  logger.error(`❌ MongoDB connection failed: ${error.message}`);
  process.exit(1);
});
