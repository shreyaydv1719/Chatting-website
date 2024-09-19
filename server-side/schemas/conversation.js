const mongoose = require("mongoose");

const conversationschema = mongoose.Schema({
  members: {
    type: Array,
    required: true,
  }
});

const Conversation = mongoose.model("conversation", conversationschema);

module.exports = Conversation;
