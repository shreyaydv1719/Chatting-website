const mongoose = require("mongoose");

const url =
  "mongodb+srv://harshsrivastava07:********@cluster0.bsbrmty.mongodb.net/?retryWrites=true&w=majority";

mongoose
  .connect(url, { useNewUrlParser: true, dbName: "Chatting" })
  .then(() => {
    console.log("connected to db");
  })
  .catch((e) => {
    console.log("error", e);
  });
