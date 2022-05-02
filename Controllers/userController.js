"use strict";

const argon2 = require("argon2");
const fs = require("fs");

/*************************************
 * Require Models
 *************************************/
const userModel = require("../Models/userModel");

// Create new user
async function createNewUser(req, res, next) {
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
    // return res.status(201).redirect("/login");
  } else {
    const conflictedUser = userModel.getUserByUsername(username);
    if (conflictedUser) {
      req.flash("usernameConflict", "Username already taken");
    } else {
      req.flash("emailConflict", "Email already taken");
    }

    return res.redirect("/register");
  }

  next();
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
  if (req.user.role === "student" || req.user.role === "tutor") {
    res.render("courses", { userCourses: userCourses, userName: userName });
    // } else {
    //   res.render("tutorDashboard", {
    //     userCourses: userCourses,
    //     userName: userName,
    //   });
  }
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

function submitAssessment(req, res, next) {
  if (!req.file || Object.keys(req.file).length === 0) {
    req.flash("fileUploadFailure", "Please select a file to upload");
    return res.redirect(`/viewCourse/${req.params.CRN}/assessments`);
  } else {
    // console.log("BODY", req.file.path);
    const postedDate = +new Date();
    const assessmentType = req.body.assessment.split("/")[3].toLowerCase();
    const assessmentName = req.body.assessment.split("/")[5].toLowerCase();
    const originalFileName = req.file.originalname;

    const assessmentInserted = userModel.submitAssessment(
      req.user.userID,
      req.params.CRN,
      postedDate,
      assessmentName,
      assessmentType,
      req.file.path,
      originalFileName
    );

    if (!assessmentInserted) {
      fs.unlink(req.file.path, (err) => {
        if (err) throw err;
      });
      req.flash(
        "fileUploadFailure",
        "File not uploaded successfully, a file is already submitted for the selected assignment type and name"
      );
      return res.redirect(`/viewCourse/${req.params.CRN}/assessments`);
    } else {
      console.log("File uploaded successfully");
      req.flash("fileUploadSuccess", "File uploaded successfully");
    }
    // return res.redirect(`/viewCourse/${req.params.CRN}/assessments`);
    next();

    // } else {
    //   req.flash(
    //     "fileUploadFailure",
    //     "File already uploaded for assessment (implementation soon) "
    //   );
    //   return res.redirect(`/viewCourse/${req.params.CRN}/assessments`);
    // }
  }
}

//validates that the user is a student or tutor
function validateUser(req, res, next) {
  if (req.user.role == "student" || req.user.role == "tutor") {
    next();
  } else {
    res.redirect("back");
  }
}

module.exports = {
  createNewUser,
  checkAuthenticated,
  checkNotAuthenticated,
  viewUserCourses,
  viewTaughtCourses,
  submitAssessment,
  validateUser,
};
