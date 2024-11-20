import mongoose, { Schema } from "mongoose";

const tokenSchema = new mongoose.Schema(
  {
    user_id: {
      type: Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    token: {
      type: String,
    },
    token_type: {
      type: String,
    },
  },
  {
    timestamps: {
      createdAt: "create_at",
      updatedAt: "updated_at",
    },
    collection: "user_token",
  }
);

export default mongoose.model("user_token", tokenSchema);
