const express = require("express");
const userModel = require("./models/user.model");
const postModel = require("./models/post.model");
const cookieParser = require("cookie-parser");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const upload = require('./Utils/multer.config')
const path = require("path");
// const upload = require("./Utils/multer.config");

const app = express();
const port = 3000;

app.set("view engine", "ejs");
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname,"public")));

//--------------------------------------------------------------------------------

app.get("/", (req, res) => {
  res.render("index");
});

app.get("/login", (req, res)=>{
    res.render("login");
})

//--------------------------------------------------------------------------------


// REGISTERING USER
app.post("/register", async (req, res) => {
  let { email, name, username, password, age } = req.body;

  let user = await userModel.findOne({ email });
  if (user) return res.status(500).send("User Already exists");

  // Converting plain password from user to complex string using bcrypt
  bcrypt.genSalt(10, (err, salt) => {
    bcrypt.hash(password, salt, async (err, hash) => {
      let user = await userModel.create({
        username,
        name,
        age,
        email,
        password: hash,
      });

    // Creating Json Web Token
    let token = jwt.sign({email :email, userid :user._id}, "dubeyji");
    res.cookie("token", token);
    res.send("Registered User");


    });
  });

});

//--------------------------------------------------------------------------------

// USER LOGIN
app.post("/login", async (req, res) => {

    let { email, password, } = req.body;
    let user = await userModel.findOne({ email });
  if (!user) return res.status(500).send("Something went Wrong");

  // Checking password matches or not
  bcrypt.compare( req.body.password, user.password, (err, result)=>{
    if(result) {
        // creating cookie jwt on password match 
        let token = jwt.sign({email: email, userid: user._id}, "dubeyji");
        res.cookie("token", token);
        // sending response
        res.status(200).redirect("/profile");
    }
    else res.redirect('/login');
  });

  });

//--------------------------------------------------------------------------------

// USER LOGOUT

app.get("/logout", (req, res)=>{
    res.cookie("token", "");
    res.redirect("/login");
})

//--------------------------------------------------------------------------------

// PROTECTED ROUTE MIDDLEWARE

function isLoggedIn(req, res, next){
    if(req.cookies.token == "") res.redirect("/login");
    else{
        let data = jwt.verify(req.cookies.token, "dubeyji");
        req.user = data;
        next();
    }
}

// Example for protected route 
// app.get("/profile", isLoggedIn, async (req,res)=>{
//     let user = await userModel.findOne({email: req.user.email}).populate("posts");
//     console.log(user.username);
//     // Showing posts
//     // user.populate("posts");

//     // Sending user data to profile page 
//     res.render("profile", {user});
// });
app.get("/profile", isLoggedIn, async (req, res) => {
  try {
    let user = await userModel.findOne({ email: req.user.email }).populate("posts");

    if (!user) {
      return res.status(404).send("User not found.");
    }

    // Ensure user data is sent to the template
    res.render("profile", { user });
  } catch (err) {
    console.error("Error fetching user:", err);
    res.status(500).send("Internal Server Error");
  }
});


//--------------------------------------------------------------------------------

// CREATING POST ROUTE
app.post("/post", isLoggedIn, async (req,res)=>{
  let user = await userModel.findOne({email: req.user.email});
  let {content} = req.body;

  let post = await postModel.create({
    user: user._id,
    content,
  });

  user.posts.push(post._id);
  await user.save();

  res.redirect("/profile");
});

//--------------------------------------------------------------------------------

// Creating LIKE function
app.get("/like/:id", isLoggedIn, async (req,res)=>{

  let post = await postModel.findOne({_id: req.params.id}).populate("user");

  // Checking is user is already present
  if (post.likes.indexOf(req.user.userid) === -1) {
    post.likes.push(req.user.userid);
  }
  else{
    post.likes.splice(post.likes.indexOf(req.user.userid), 1);
  }
  await post.save();

  res.redirect("/profile");
  // res.render("profile")

});

//--------------------------------------------------------------------------------

// Creating DELETE function
app.get("/delete/:id", isLoggedIn, async (req,res)=>{

  let post = await postModel.findOneAndDelete({_id: req.params.id}).populate("user");
  res.redirect("/profile");
  
});
//--------------------------------------------------------------------------------

// Creating Edit Function

app.get("/edit/:id", isLoggedIn, async (req,res)=>{

  let post = await postModel.findOne({_id: req.params.id}).populate("user");
  // Post dhund k usko edit krne k liye new form show krna hoga
  res.render("edit",{post});
});

// New Updated data ka route 
app.post("/update/:id", isLoggedIn, async (req,res)=>{
  let post = await postModel.findOneAndUpdate(
    { _id: req.params.id },  // Find post by ID
    { content: req.body.content },  // Update content field
    { new: true }  // Return the updated document
  );
  console.log(req.body)
  res.redirect("/profile");
  // {content: req.body.content} ===> content is field name which is to be updated and req.body.content is data coming form updated form
});


//--------------------------------------------------------------------------------

// Creating Image Uploading functionality

app.get("/profile/upload", (req, res) => {
  res.render("profileupload");
});

app.post("/upload", isLoggedIn, upload.single("imgName"), async (req, res)=>{
  console.log(req.file);
  // Function to show Uploaded image as User's Profile pic 
  let user = await userModel.findOne({email: req.user.email});
  user.profilepic = req.file.filename;
  await user.save();
  res.redirect("/profile");
});

//--------------------------------------------------------------------------------

app.listen(port, () => {
  console.log(`App is running on port ${port}`);
});
