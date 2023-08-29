const User = require('../model/user');

const userRegister = async (req, res) => {
  const { fullName, email, phone, password } = req.body;
  try {
    const userData = await User.create({ fullName, email, phone, password });

    return res.status(200).json({
      message: 'User Register successfully.',
      success: false,
      userData,
    });
  } catch (error) {
    return res.status(400).json({ message: error.message, success: false });
  }
};

module.exports = userRegister;
