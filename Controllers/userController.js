"use strict";

const argon2 = require("argon2");
const { func } = require("joi");

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

function submitAssessment(req, res) {
  if (!req.files || Object.keys(req.files).length === 0) {
    req.flash("fileUploadFailure", "Please select a file to upload");
    return res.redirect(`/viewCourse/${req.params.CRN}/assessments`);
    // res.render("assessments", {
    //   currentAssessments: userModel.getSubmittedFile(
    //     req.user.userID,
    //     req.params.CRN
    //   ),
    //   CRN: req.params.CRN,
    // });
  } else {
    const file = req.files.inputFile;
    const path = __dirname + "/../public/files/studentSubmissions/" + file.name;

    const inserted = userModel.submitAssessment(
      req.user.userID,
      req.params.CRN,
      req.body.assessment,
      file.name
    );

    if (inserted) {
      file.mv(path, (err) => {
        if (err) {
          console.log("Unable to upload file:");
          console.log(err);
          req.flash("fileUploadFailure", "File not uploaded successfully");
        } else {
          console.log("File uploaded successfully");
          req.flash("fileUploadSuccess", "File uploaded successfully");
        }
        return res.redirect(`/viewCourse/${req.params.CRN}/assessments`);
      });
    } else {
      req.flash(
        "fileUploadFailure",
        "File already uploaded for assessment (implementation soon) "
      );
      return res.redirect(`/viewCourse/${req.params.CRN}/assessments`);
    }
  }
}

module.exports = {
  createNewUser,
  checkAuthenticated,
  checkNotAuthenticated,
  viewUserCourses,
  viewTaughtCourses,
  submitAssessment,
};
