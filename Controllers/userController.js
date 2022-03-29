"use strict";

const argon2 = require("argon2");

/*************************************
 * Require Models
 *************************************/
const userModel = require("../Models/userModel");

// Create new user
async function createNewUser(req, res) {
  const { email, username, firstName, lastName, password } = req.body;

  const created = await userModel.createUser(
    email,
    username,
    firstName,
    lastName,
    password,
    req.body
  );

  // account was succesfully created
  if (created) {
    req.flash("accountCreated", "Account Created Successfully!");
    return res.status(201).redirect("/login");
  } else {
    const conflictedUser = userModel.getUserByUsername(username);
    if (conflictedUser) {
      req.flash("usernameConflict", "Username already taken");
    } else {
      req.flash("emailConflict", "Email already taken");
    }

    res.redirect("/register");
  }
}

function checkAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }

  return res.redirect("/login");
}

function checkNotAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return res.redirect("/");
  }

  next();
}

function checkRole(req, res) {
  const user = req.user;
  console.log("user session: ", user);
}

function viewUserCourses(req, res) {
  const userID = req.session.passport.user;
  const userCourses = userModel.getUserCourses(userID);
  const user = userModel.getUserByID(userID);
  const userName = user.firstName;

  //   req.flash("userCourses", userCourses);
  res.render("courses", { userCourses: userCourses, userName: userName });
}

//change this and add databse
function viewTaughtCourses(req, res) {
  const userID = req.session.passport.user;
  const userCourses = userModel.getUserCourses(userID);
  const user = userModel.getUserByID(userID);
  const userName = user.firstName;

  //   req.flash("userCourses", userCourses);
  res.render("adminCourses", { userCourses: userCourses, userName: userName });
}

module.exports = {
  createNewUser,
  checkAuthenticated,
  checkNotAuthenticated,
  viewUserCourses,
  viewTaughtCourses,
};
