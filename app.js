const io = require('./controller/chat/chat.connection');
require('dotenv').config();
const express = require('express');
const http = require('http');
require('./config/mongoose');

const PORT = process.env.PORT || 8003;

const app = express();

const server = http.Server(app);
io.attach(server);

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

const userRouter = require('./routes/user');
const userJoinTag = require('./routes/userJoinTag');

app.use('/user', userRouter);
app.use('/user-join-tag', userJoinTag);

server.listen(`${PORT}`, (err) => {
  if (err) throw console.error('Something went wrong to run server', err);
  console.log(`Server is running on port: ${PORT}`);
});
