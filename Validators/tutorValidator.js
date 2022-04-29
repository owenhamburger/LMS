"use strict";

const joi = require("joi").extend(require("@joi/date"));

const validateOpts = {
  abortEarly: false,
  stripUnknown: true,
  errors: {
    escapeHtml: true,
  },
  errors: {
    wrap: {
      label: "",
    },
  },
};

/*************************************
 * Validate Tutor Reservation
 *************************************/
const minDate = new Date();
const maxDate = new Date();

// subtracting 1 day since min is exclusive
minDate.setDate(minDate.getDate() - 1);

maxDate.setDate(maxDate.getDate() + 30);

console.log(maxDate);

const reserveSchema = joi.object({
  date: joi
    .date()
    .format("YYYY-MM-DD")
    .min(minDate)
    .max(maxDate)
    .custom((value, helper) => {
      if (value.getDay() === 6 || value.getDay() === 0) {
        return helper.message(
          "Scheduling appointments on weekends is not available"
        );
      } else {
        return true;
      }
    })
    .messages({
      "date.min": "You can't reserve appointments in the past!",
      "date.max": "You can only reserve appointments 30 days from today!",
    }),

  meetingTime: joi
    .string()
    .regex(/^[0-9][0-9]:[0-9][0-9]-[0-9][0-9]:[0-9][0-9] ([ap][m])$/m)
    .messages({
      "object.regex":
        "Invalid time format, please select a time from the provided options!",
    }),
});

function validateReservation(req, res, next) {
  const { value, error } = reserveSchema.validate(req.body, validateOpts);

  // check for validation erros
  if (error) {
    console.error(error);

    // get errors
    const errorMessages = error.details.map((detail) => detail.message);

    req.flash("reservationError", errorMessages);
    return res.redirect(
      `/viewCourse/${req.params.CRN}/tutorReservation/${req.params.selectedTutorID}`
    );
  }

  //   req.body = value;
  next();
}

module.exports = {
  validateReservation,
};
