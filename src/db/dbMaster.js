import mongoose from "mongoose";
import {
  MASTER_DB_NAME,
  MASTER_DB_PASSWORD,
  MASTER_DB_USERNAME,
} from "../config/index.js";
import logger from "../utils/logger.js";

const db = mongoose.createConnection(
  `mongodb+srv://${MASTER_DB_USERNAME}:${MASTER_DB_PASSWORD}@cluster0.co4kp.mongodb.net/${MASTER_DB_NAME}`,
  {
    maxPoolSize: 100,
    minPoolSize: 10,
    serverApi: { version: "1", strict: false, deprecationErrors: true },
    autoCreate: true,
    autoIndex: true,
  }
);

db.on("connected", function () {
  logger.info("✅ Mongoose connection open to master DB");
  logger.info(`📌 DB Name: ${db.name}`);
  logger.info(`📌 DB Host: ${db.host}`);
});

db.on("error", function (err) {
  logger.error(`❌ Mongoose connection error: ${err.message}`);
});

db.on("disconnected", function () {
  logger.warn("⚠️ Mongoose connection disconnected for master DB");
});

db.on("reconnected", function () {
  logger.info("✅ Mongoose connection reconnected for master DB");
  logger.info(`📌 DB Name: ${db.name}`);
  logger.info(`📌 DB Host: ${db.host}`);
});

process.on("SIGINT", async function () {
  await db.close(true);
  logger.warn("⚠️ Mongoose connection closed due to app termination");
  process.exit(0);
});

export default db; // ✅ Export the DB connection directly
