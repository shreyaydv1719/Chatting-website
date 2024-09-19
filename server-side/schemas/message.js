const mongoose = require("mongoose");

const messageschema = mongoose.Schema({
  conversationid: {
    type: String
  },
  message:{
    type: String
  },
  senderid:{
    type: String
  }
});

const Message = mongoose.model("message", messageschema);

module.exports = Message;
