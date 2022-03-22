"use strict";

require("dotenv").config();

const redis = require("redis");
const session = require("express-session");
const RedisStore = require("connect-redis")(session);
const passport = require('passport');
const flash = require('express-flash');
const methodOverride = require('method-override');

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
    }
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

app.use(methodOverride('_method'));
app.use(express.json());
app.use(express.urlencoded({extended: false}));

// // Make Public folder accessible without defining explicit endpoints
// app.use(express.static(__dirname + "/Public"));

app.set('view engine', 'ejs');

/*************************************
 * Require Controllers
 *************************************/
const userController = require("./Controllers/userController.js");

 /*************************************
 * Require Validators
 *************************************/
const userValidator = require("./Validators/userValidator");

/*************************************
 * Create Endpoints
 *************************************/

app.get('/', userController.checkAuthenticated, (req, res) => {
  res.render("dashboard");
});

// app.get('/index', userController.checkAuthenticated, (req, res) => {
//   res.redirect("./index.html");
// });

 app.get('/register', userController.checkNotAuthenticated, (req, res) => {
   res.render('register.ejs')
});

app.post('/register',
  userController.checkNotAuthenticated,
  userValidator.validateUserCreationBody, 
  userController.createNewUser
);

app.get('/login', userController.checkNotAuthenticated, (req, res) => {
  res.render('login')
});
  
app.post('/login', userController.checkNotAuthenticated, passport.authenticate('local', {
  successRedirect: '/',
  failureRedirect: '/login',
  failureFlash: true
}));

app.get('/logout', (req, res) =>{
  req.logOut();
  req.flash('logOutSuccess', "Log Out Successful");
  res.redirect('/login');
});

module.exports = app;