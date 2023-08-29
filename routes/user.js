const express = require('express');
const userRegister = require('../controller/userController');

const userRoutes = express.Router();

userRoutes.post('/register', userRegister);

module.exports = userRoutes;
