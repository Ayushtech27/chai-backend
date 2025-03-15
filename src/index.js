import app from "./app.js";
import { PORT } from "./config/index.js";
import { connectDB } from "./db/dbMaster.js";
import logger from "./utils/logger.js";

connectDB()
  .then(() => {
    app.listen(PORT, () => {
      logger.debug(`🚀 Server is running at port: ${PORT}`);
    });
  })
  .catch((error) => {
    logger.error(`❌ MongoDB connection failed: ${error}`);
  });
