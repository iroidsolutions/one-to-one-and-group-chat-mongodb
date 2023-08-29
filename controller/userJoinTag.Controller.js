const userJoinTag = require('../model/userJoinTag');

const userJoinTagAdd = async (req, res) => {
  const { userId, tagId, groupId } = req.body;
  try {
    const data = await userJoinTag.create({
      userId,
      tagId,
      groupId,
    });

    return res.status(200).json({ message: 'User JOIn tag.', sucess: true, data });
  } catch (error) {
    return res.status(400).json({ message: error.message, success: false });
  }
};

module.exports = userJoinTagAdd;
