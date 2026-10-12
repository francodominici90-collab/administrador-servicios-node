import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    author: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100
    },
    text: {
      type: String,
      required: true,
      trim: true,
      maxlength: 1000
    }
  },
  {
    timestamps: {
      createdAt: true,
      updatedAt: false
    }
  }
);

const Message = mongoose.model("Message", messageSchema);

export default Message;