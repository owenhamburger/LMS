"use strict";
/*************************************
 * Require Models
 *************************************/
const nodemailer = require("nodemailer");
const userModel = require("../Models/userModel");

const transport = nodemailer.createTransport({
  service: "Gmail",
  auth: {
    user: "lmsnoreply77@gmail.com",
    pass: "lmspassword",
  },
});

//Sends an email on registration
function sendRegistrationEmail(req, res, next) {
  console.log("In registration email controller");
  const mailOptions = {
    from: "lmsnoreply77@gmail.com",
    to: req.body.email,
    // to: "owenhamburger@gmail.com",
    subject: `Welcome ${req.body.firstName} ${req.body.lastName}`,
    html: `Thanks for registering with LMS. You are enrolled and are entered in our system!`,
  };

  transport.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log(error);
    }
    console.log(`Message sent: ${info.response}`);
  });
  next();
}

//Sends an email on file upload from instructor
function sendUploadEmail(req, res, next) {
  console.log("In upload email controller");

  var students = [];
  students.push(userModel.getStudentsByCRN(req.params.CRN));

  for (var i = 0; i < students[0].length; i++) {
    var recipient = students[0][i].userID;
    var user = userModel.getUserByID(recipient);
    const mailOptions = {
      from: "lmsnoreply77@gmail.com",
      to: user.email,
      subject: `You have a new ${req.body.assessmentType} Assessment`,
      html: `A new assessment has been uploaded. Check LMS for more information! This assesment is due: ${req.body.dueDate}`,
    };

    transport.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log(error);
      }
      console.log(`Message sent: ${info.response}`);
    });
  }
  next();
}

//Sends an email on tutor registration to tutor
function sendTutorEmail(req, res, next) {
  console.log("In tutor email controller");
  const tutor = userModel.getUserByID(req.params.selectedTutorID);
  const className = userModel.getCourseByCRN(req.params.CRN);
  const mailOptions = {
    from: "lmsnoreply77@gmail.com",
    to: tutor.email,
    // to: "owenhamburger@gmail.com",
    subject: `${tutor.firstName} ${tutor.lastName}, you have a new reservation for ${className.courseName}`,
    html: `${req.user.firstName} ${req.user.lastName} has made a reservation for ${req.body.date} at ${req.body.meetingTime}`,
  };

  transport.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log(error);
    }
    console.log(`Message sent: ${info.response}`);
  });
  next();
}

//Sends an email on tutor registration to student
function sendStudentEmail(req, res, next) {
  console.log("In student email controller");
  const tutor = userModel.getUserByID(req.params.selectedTutorID);
  const className = userModel.getCourseByCRN(req.params.CRN);
  const mailOptions = {
    from: "lmsnoreply77@gmail.com",
    to: req.user.email,
    // to: "owenhamburger@gmail.com",
    subject: `Confirmation of reservation for ${className.courseName}`,
    html: `This email serves as a confirmation of the reservation for ${req.body.date} at ${req.body.meetingTime}. 
    The selected tutor for this time slot is ${tutor.firstName} ${tutor.lastName}.`,
  };

  transport.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log(error);
    }
    console.log(`Message sent: ${info.response}`);
  });
  next();
}

//Sends an email on tutor registration to student
function sendSubmissionConfirmation(req, res, next) {
  console.log("In student submission email controller");
  const mailOptions = {
    from: "lmsnoreply77@gmail.com",
    to: req.user.email,
    // to: "owenhamburger@gmail.com",
    subject: `Work Submitted Successfully`,
    html: `This email serves as a confirmation of your submission for the ${req.body.assessment} assessment.`,
  };

  transport.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log(error);
    }
    console.log(`Message sent: ${info.response}`);
  });
  next();
}

module.exports = {
  sendRegistrationEmail,
  sendUploadEmail,
  sendTutorEmail,
  sendStudentEmail,
  sendSubmissionConfirmation,
};
