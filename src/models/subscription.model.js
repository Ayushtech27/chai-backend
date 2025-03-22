import db from "../db/dbMaster.js";
import { Schema } from "mongoose";

const subscriptionSchema = newSchema(
  {
    subscriber: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    channel: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

export const Subscription = db.model("Subscription", subscriptionSchema);
