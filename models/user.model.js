const mongoose = require("mongoose");

// mongoose.connect("mongodb://127.0.0.1:27017/miniproject");

mongoose.connect("mongodb+srv://harshitdubey02004:harshit20@cluster0.33naz.mongodb.net/")
    .then(() => console.log('Connected to MongoDB Atlas'))
    .catch((error) => console.log('Error connecting to MongoDB Atlas:', error));
  
const userSchema = mongoose.Schema({
  username: String,
  name: String,
  age: Number,
  email: String,
  password: String,
  profilepic:{
    type: String,
    default: "defaultUser.png"
  },
  posts: [{ type:mongoose.Schema.Types.ObjectId, ref: "Post" }],
});

module.exports = mongoose.model('User', userSchema);