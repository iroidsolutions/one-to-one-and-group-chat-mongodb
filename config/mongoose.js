const mongoose = require("mongoose");

const URL = process.env.MONGO_URL;

mongoose
  .connect(URL, {})
  .then(() => {
    console.log(`MongoDB Connect: ${URL}`);
  })
  .catch((err) => {
    console.log(err, "DB Connect error");
  });
