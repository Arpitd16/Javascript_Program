require("dotenv").config();
const express = require("express");
const bodyparsr = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const encryp = require("mongoose-encryption"); //md5 is use to encrypt word
const session = require("express-session");
const passport = require("passport");
//const passportlocal=require("passport-local");
const passportlocalmongoose = require("passport-local-mongoose");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const findOrCreate = require("mongoose-findorcreate");
// const bcrypt = require('bcrypt');
// const saltRounds = 10;//it is for bcrypt

const app = express();
 
//console.log(process.env.API_KEY);

app.use(express.static("public"));
app.set("view engine", "ejs");
app.use(bodyparsr.urlencoded({ extended: true }));
app.use(
  session({
    secret: "it own small secret  cat",
    resave: false,
    saveUninitialized: false,
  })
);

app.use(passport.initialize());
app.use(passport.session());

mongoose.connect("mongodb://127.0.0.1:27017/KADB", { useNewUrlParser: true });
const userSchema = new mongoose.Schema({
  email: String,
  password: String,
  googleId: String,
  secret: String,
});
userSchema.plugin(passportlocalmongoose);
userSchema.plugin(findOrCreate);
//userSchema.plugin(encryp,{secret:process.env.SECRET, encryptedFields:["password"]});
const User = new mongoose.model("User", userSchema);

// CHANGE: USE "createStrategy" INSTEAD OF "authenticate"
passport.use(User.createStrategy());

passport.serializeUser(function (user, done) {
  done(null, user.id);
});

passport.deserializeUser(function (id, done) {
  User.findById({ id })
    .then(function (user) {
      done(err, user);
    })
    .catch(function (err) {
      console.log(err);
    });
});

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.CLIENT_ID,
      clientSecret: process.env.CLIENT_SECRET,
      callbackURL: "http://localhost:3000/auth/google/secrets",
      userProfileURL: "https://www.googleapis.com/oauth2/v3/userinfo",
    },
    function (accessToken, refreshToken, profile, cb) {
      User.findOrCreate({ googleId: profile.id }, function (err, user) {
        return cb(err, user);
      });
    }
  )
);
app.get("/", function (req, res) {
  res.render("home");
});
app.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["profile"] })
);

app.get(
  "/auth/google/secrets",
  passport.authenticate("google", { failureRedirect: "/login" }),
  function (req, res) {
    // Successful authentication, redirect home.
    res.redirect("/secrets");
  }
);

app.get("/login", function (req, res) {
  res.render("login");
});
app.get("/register", function (req, res) {
  res.render("register");
});
app.get("/secrets", function (req, res) {
  if (req.isAuthenticated()) {
    res.render("secrets");
  } else {
    res.redirect("/login");
  }
});

app.get("/submit", function (req, res) {
  if (req.isAuthenticated()) {
    res.render("submit");
  } else {
    res.redirect("/login");
  }
});
app.get("/logout", (req, res) => {
  req.logout(req.user, (err) => {
    if (err) return next(err);
    res.redirect("/");
  });
});

app.post("/register", function (req, res) {
  User.register(
    { username: req.body.username },
    req.body.password,
    function (err, user) {
      if (err) {
        console.log(err);
        res.redirect("/register");
      } else {
        passport.authenticate("local")(req, res, function () {
          res.redirect("/secrets");
        });
      }
    }
  );
  // bcrypt.hash(req.body.password, saltRounds, function(err, hash) {
  //    const newuser = new User({
  //   email: req.body.username,
  //   password: hash,
  // });
  // newuser.save().then(function (err) {
  //   if (err) {
  //     console.log(err);
  //   } else {
  //       res.render("secrets");
  //   }
  // });
  // });
});
app.post("/login", function (req, res) {
  const user = new User({
    username: req.body.username,
    password: req.body.password,
  });
  req.login(user, function (err) {
    if (err) {
      console.log(err);
    } else {
      passport.authenticate("local")(req, res, function () {
        res.redirect("/secrets");
      });
    }
  });
  // const username=req.body.username;
  // const password=req.body.password;
  // User.findOne({email:username}).then(function(err,founduser){
  //     if(err){
  //         console.log(err);
  //     }
  //     else{
  //       if(founduser){
  //         bcrypt.compare(password, founduser.password , function(err, result) {
  //           if(result===true)
  //           {
  //               res.render("secrets");
  //           }
  //       });

  //       }
  //     }
  // })
});
app.listen(3000, function () {
  console.log("server are on port 3000");
});
