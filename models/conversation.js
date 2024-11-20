import mongoose, { Schema } from "mongoose";

const conversationSchema = new mongoose.Schema(
  {
    sender: {
      type: Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    receiver: {
      type: Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    messages: [
      {
        type: Schema.Types.ObjectId,
        ref: "message",
      },
    ],
  },
  {
    timestamps: {
      createdAt: "create_at",
      updatedAt: "updated_at",
    },
    collection: "conversation",
  }
);

export default mongoose.model("conversation", conversationSchema);
