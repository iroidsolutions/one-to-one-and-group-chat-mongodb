const { Schema, Types, model } = require("mongoose");

const groupChatSchema = new Schema({
  groupId: {
    type: String,
    required: true,
  },
  senderId: {
    type: Types.ObjectId,
    ref: "User",
  },
  image: {
    type: String,
  },
  message: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: ["0 - text", "1 - audio", "2 - video", "3 - photo"],
    default: "0 - text",
  },
  createdAt: {
    type: Date,
    default: null,
  },
});

module.exports = model("Group-Chat", groupChatSchema);
