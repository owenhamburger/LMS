"use strict";

require("dotenv").config();

const redis = require("redis");
const session = require("express-session");
const RedisStore = require("connect-redis")(session);
const passport = require("passport");
const flash = require("express-flash");
const methodOverride = require("method-override");
const path = require("path");

/*************************************
 * Create App
 *************************************/
const express = require("express");
const app = express();

/*************************************
 * Initialize Session
 *************************************/
const sessionConfig = {
  store: new RedisStore({ client: redis.createClient() }),
  secret: process.env.COOKIE_SECRET,
  resave: false,
  saveUninitialized: false,
  name: "session", // now it is just a generic name
  cookie: {
    httpOnly: true,
    maxAge: 1000 * 60 * 60 * 8, // 8 hours
  },
};

/*************************************
 * Initialize Middleware
 *************************************/
app.use(flash());
app.use(session(sessionConfig));
app.use(passport.initialize());
app.use(passport.session());

const initializePassport = require("./passportConfig");
initializePassport(passport);

app.use(methodOverride("_method"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Make Public folder accessible without defining explicit endpoints
app.use(
  "/public",
  express.static(path.join(__dirname, "Public"), {
    index: false,
    extensions: ["html"],
  })
);

app.set("view engine", "ejs");

/*************************************
 * Require Controllers
 *************************************/
const userController = require("./Controllers/userController.js");

/*************************************
 * Require Validators
 *************************************/
const userValidator = require("./Validators/userValidator");
const userModel = require("./Models/userModel");

/*************************************
 * Create Endpoints
 *************************************/

app.get("/", userController.checkAuthenticated, (req, res) => {
  // res.redirect("./public/index");
  userController.checkRole(req, res);
  res.render("dashboard");
});

// app.get("/browserJS/browserJS.js", (req, res) => {
//   res.sendFile("C:/Users/Fadya/Desktop/LMS_Project/browserJS/browserJS.js");
// });

app.get(
  "/courses",
  userController.checkAuthenticated,
  userController.viewUserCourses
);

app.get("/viewCourse", userController.checkAuthenticated, (req, res) => {
  res.render("viewCourse");
});

app.get("/viewCourse/:CRN", userController.checkAuthenticated, (req, res) => {
  res.render("viewCourse", {
    courseName: userModel.getCourseByCRN(req.params.CRN),
  });
});

app.get("/register", userController.checkNotAuthenticated, (req, res) => {
  res.render("register.ejs", { allCourses: userModel.getallCourses() });
});

app.post(
  "/register",
  userController.checkNotAuthenticated,
  userValidator.validateUserCreationBody,
  userController.createNewUser
);

app.get("/login", userController.checkNotAuthenticated, (req, res) => {
  res.render("login");
});

app.post(
  "/login",
  userController.checkNotAuthenticated,
  passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/login",
    failureFlash: true,
  })
);

app.get("/logout", (req, res) => {
  req.logOut();
  req.flash("logOutSuccess", "Log Out Successful");
  res.redirect("/login");
});

module.exports = app;
