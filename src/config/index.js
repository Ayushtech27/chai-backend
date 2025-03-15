import dotenv from "dotenv";

dotenv.config({ path: "../../.env" });

export const PORT = process.env.PORT || 8080;
export const MASTER_DB_USERNAME = process.env.MASTER_DB_USERNAME;
export const MASTER_DB_PASSWORD = process.env.MASTER_DB_PASSWORD;
export const MASTER_DB_NAME = process.env.MASTER_DB_NAME;
export const CORS_ORIGIN = process.env.CORS_ORIGIN;
