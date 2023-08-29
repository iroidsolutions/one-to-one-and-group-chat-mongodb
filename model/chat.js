const { Types, Schema, model } = require('mongoose');
const moment = require('moment-timezone');

const chatSchema = new Schema(
  {
    senderId: {
      type: Types.ObjectId,
      ref: 'User',
    },
    receiverId: {
      type: Types.ObjectId,
      ref: 'User',
    },
    message: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ['0 - text', '1 - audio', '2 - video', '3 - photo'],
      default: '0 - text',
    },
    seenAt: {
      type: Date,
      default: null,
    },
    sendMessage: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

module.exports = model('Chat', chatSchema);
