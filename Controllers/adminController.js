"use strict";

/*************************************
 * Require Models
 *************************************/
const userModel = require("../Models/userModel");
const adminModel = require("../Models/adminModel");
const { func } = require("joi");

function uploadAssessment(req, res) {
  if (!req.files || Object.keys(req.files).length === 0) {
    req.flash("fileUploadFailure", "Please select a file to upload");
    res.redirect(`/adminViewAssesments/${req.params.CRN}`);
  } else {
    //Store the name and path of the inputfile
    const file = req.files.inputFile;
    const path = __dirname + "/../public/files/" + file.name;

    const postedDate = +new Date();
    const myDate = req.body.dueDate.split("-");
    const dueDate = new Date(
      parseInt(myDate[0]),
      parseInt(myDate[1]) - 1,
      parseInt(myDate[2])
    ).getTime();

    const assessmentType = req.body.assessmentType;

    const assessmentInserted = adminModel.insertAssessment(
      req.params.CRN,
      assessmentType,
      file.name,
      dueDate,
      postedDate
    );

    if (assessmentInserted) {
      //use the mv function to store the file on the server
      file.mv(path, (err) => {
        if (err) {
          console.log("Unable to upload file:");
          console.log(err);
          req.flash("fileUploadFailure", "File not uploaded successfully");
        } else {
          console.log("File uploaded successfully");
          req.flash("fileUploadSuccess", "File uploaded successfully");
        }
        return res.redirect(`/adminViewAssesments/${req.params.CRN}`);
      });
    } else {
      req.flash("fileUploadFailure", "File is already uploaded");
      return res.redirect(`/adminViewAssesments/${req.params.CRN}`);
    }
  }
}

function viewSubmissions(req, res) {
  res.render("viewSubmissions", {
    submissions: adminModel.viewSubmissions(
      req.params.CRN,
      req.params.assessmentFile
    ),
    CRN: req.params.CRN,
  });
}

module.exports = {
  uploadAssessment,
  viewSubmissions,
};
