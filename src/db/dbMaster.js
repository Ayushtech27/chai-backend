import mongoose from "mongoose";
import {
  MASTER_DB_NAME,
  MASTER_DB_PASSWORD,
  MASTER_DB_USERNAME,
} from "../config/index.js";
import logger from "../utils/logger.js";
import util from "util";

export const connectDB = async () => {
  try {
    const db = mongoose.createConnection(
      `mongodb+srv://${MASTER_DB_USERNAME}:${MASTER_DB_PASSWORD}@cluster0.co4kp.mongodb.net/${MASTER_DB_NAME}`,
      {
        maxPoolSize: 200,
        minPoolSize: 200,
        serverApi: { version: "1", strict: false, deprecationErrors: true },
        autoCreate: true,
        autoIndex: true,
        minPoolSize: 200,
      }
    );

    db.on("connected", function () {
      logger.info("✅ Mongoose connection open to master DB");
      logger.info(`📌 DB Name: ${db.name}`);
      logger.info(`📌 DB Host: ${db.host}`);
      //   logger.debug(`📌 Full DB Object: ${util.inspect(db, { depth: 3 })}`);
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
      //   logger.debug(`📌 Full DB Object: ${util.inspect(db, { depth: 3 })}`);
    });

    db.on("SIGINT", async function () {
      await db.close(true);
      logger.warn("⚠️ Mongoose connection closed due to app termination");
      process.exit(0);
    });
    return db;
  } catch (error) {
    logger.error(`❌ Database connection failed: ${error.message}`);
    process.exit(1);
  }
};
