const { Types, Schema, model } = require('mongoose');

const groupChatSeenMsgSchema = new Schema(
  {
    userId: {
      type: Types.ObjectId,
      ref: 'User',
    },
    groupId: {
      type: String,
      required: true,
    },
    seenMessage: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

module.exports = model('Group-Chat-Seen', groupChatSeenMsgSchema);
