const express = require('express');
const userJoinTagAdd = require('../controller/userJoinTag.Controller');

const routes = express.Router();

routes.post('/add-user-tag', userJoinTagAdd);

module.exports = routes;
