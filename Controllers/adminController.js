"use strict";

const fs = require("fs");

/*************************************
 * Require Models
 *************************************/
const userModel = require("../Models/userModel");
const adminModel = require("../Models/adminModel");

function uploadAssessment(req, res) {
  if (!req.file || Object.keys(req.file).length === 0) {
    req.flash("fileUploadFailure", "Please select a file to upload");
    res.redirect(`/adminViewAssesments/${req.params.CRN}`);
  } else {
    // Set up data to store in database
    const postedDate = +new Date();
    const myDate = req.body.dueDate.split("-");
    const dueDate = new Date(
      parseInt(myDate[0]),
      parseInt(myDate[1]) - 1,
      parseInt(myDate[2])
    ).getTime();

    const assessmentName = req.body.assessmentName.toLowerCase();
    const assessmentType = req.body.assessmentType.toLowerCase();

    const assessmentInserted = adminModel.insertAssessment(
      req.params.CRN,
      assessmentName,
      assessmentType,
      postedDate,
      dueDate,
      req.file.path
    );
    if (!assessmentInserted) {
      // delete file from server
      fs.unlink(req.file.path, (err) => {
        if (err) throw err;
      });
      req.flash(
        "fileUploadFailure",
        "File not uploaded successfully, a file is already uploaded for the selected assignment type and name"
      );
      return res.redirect(`/adminViewAssesments/${req.params.CRN}`);
    } else {
      console.log("File uploaded successfully");
      req.flash("fileUploadSuccess", "File uploaded successfully");
      return res.redirect(`/adminViewAssesments/${req.params.CRN}`);
    }
  }
}

function viewSubmissions(req, res) {
  console.log(req.params);
  res.render("viewSubmissions", {
    submissions: adminModel.viewSubmissions(
      req.params.CRN,
      req.params.assessmentName,
      req.params.assessmentType
    ),
    CRN: req.params.CRN,
  });
}

function updateGrade(req, res) {
  console.log("REQ FROM CLIENT:", req.body);
  const updatedGrade = adminModel.updateGrade(
    req.body.userID,
    req.body.CRN,
    req.body.assessmentName,
    req.body.assessmentType,
    parseFloat(req.body.grade)
  );

  if (!updatedGrade) {
    console.log("couldn't update grade");
  }
  return res.redirect(
    `/adminViewAssesments/${req.body.CRN}/${req.body.assessmentName}/${req.body.assessmentType}`
  );
}
function validateAdmin(req, res, next) {
  if (req.user.role == "admin") {
    next();
  } else {
    res.redirect("back");
  }
}

module.exports = {
  uploadAssessment,
  viewSubmissions,
  updateGrade,
  validateAdmin,
};
