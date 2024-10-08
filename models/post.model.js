const mongoose = require("mongoose");
  
const postSchema = new mongoose.Schema({

  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  date: {
    type: Date,
    default: Date.now,
  },
  content: String,
  likes: [
    { type: mongoose.Schema.Types.ObjectId, ref: "User"}
  ]

});

module.exports = mongoose.model( "Post", postSchema);

// <h3 class="text-3xl mb-5 mt-10">
// Hello, <span class="text-purple-400"> <%= user.name %> </span> 🤴🏽
// </h3>