const mongoose = require("mongoose");

const DB = process.env.DATABASE;
mongoose
  .connect(process.env.DATABASE)
  .then(() => console.log("connection succefully...."))
  .catch((e) => {
    console.log("connection failed....");
  });
