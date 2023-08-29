const { default: mongoose } = require('mongoose');
const { Types, Schema, model } = require('mongoose');

const userjoinTagSchema = new Schema({
  userId: {
    type: Types.ObjectId,
    ref: 'User',
  },
  tagId: {
    type: Types.ObjectId,
    default: () => new Types.ObjectId(),
  },
  groupId: {
    type: String,
    required: true,
  },
});

module.exports = model('User-JoinTag', userjoinTagSchema);
