"use strict";

/*************************************
 * Require Models
 *************************************/
const tutorModel = require("../Models/tutorModel");

function tutorReservation(req, res, crn, tutorID) {
  const reserved = tutorModel.reserveTutor(
    req.user.userID,
    tutorID,
    crn,
    req.body.meetingTime,
    req.body.date
  );

  // reservation created successfully
  if (reserved.reserved) {
    req.flash("reservationCreated", "An appointment has been reserved!");
    return res.status(201).redirect(`/viewCourse/${crn}/tutorReservation`);
  } else {
    if (reserved.err === "SQLITE_CONSTRAINT_UNIQUE") {
      req.flash(
        "reservationError",
        "You already have an appointment at the selected date and time!"
      );
    } else {
      req.flash(
        "reservationError",
        "Sorry, the selected date and time are already taken!"
      );
    }

    return res.redirect(`/viewCourse/${crn}/tutorReservation/${tutorID}`);
  }
}

function validateTutor(req, res, next) {
  if (req.user.role == "tutor") {
    next();
  } else {
    res.redirect("back");
  }
}

module.exports = {
  tutorReservation,
  validateTutor,
};
