const { Schema, model } = require('mongoose');
const moment = require('moment-timezone');

const userSchema = new Schema(
  {
    fullName: {
      type: String,
      trim: true,
    },
    email: {
      type: String,
      trim: true,
    },
    profileImage: {
      type: String,
      trim: true,
      default: null,
    },
    phone: {
      type: String,
      trim: true,
    },
    password: {
      type: String,
      trim: true,
    },
    isOnline: {
      type: Boolean,
      default: false,
    },
    lastSeen: {
      type: String,
      default: false,
    },
    // messageSend: {
    //   type: String,
    //   default: moment
    //     .tz(Date.now(), "Asia/Kolkata")
    //     .format("YYYY-MM-DD HH:mm:ss"),
    // },
  },
  {
    timestamps: true,
  },
);

module.exports = model('User', userSchema);
