import mongoose, { Schema } from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    sender: {
      type: Schema.Types.ObjectId,
      ref: "user",
    },
    text: {
      type: String,
    },
    image_url: {
      type: String,
      default: null,
    },
    video_url: {
      type: String,
      default: null,
    },
    seen: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: {
      createdAt: "create_at",
      updatedAt: "updated_at",
    },
    collection: "message",
  }
);

export default mongoose.model("message", messageSchema);
