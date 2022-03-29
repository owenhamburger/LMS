"use strict";

const Joi = require("joi");
const { func } = require("joi");
const joi = require("joi");

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
 * Validate User Creation Body
 *************************************/

const createUserSchema = joi.object({
  username: joi
    .string()
    .min(3)
    .token()
    .lowercase()
    .required()
    .label("Username"),

  email: joi
    .string()
    .email({
      minDomainSegments: 2,
      maxDomainSegments: 3,
      tlds: { allow: ["edu"] },
    })
    .label("Email"),

  firstName: joi.string().min(1).token().required().label("First Name"),

  lastName: joi.string().min(1).token().required().label("Last Name"),

  password: joi.string().min(6).required().label("Password"),

  passwordConfirmation: joi
    .any()
    .equal(joi.ref("password"))
    .required()
    .label("Confirm password")
    .messages({ "any.only": "{{#label}} does not match" })
    .label("Confirm Password"),

  registeredClasses: joi
    .alternatives()
    .try(
      joi
        .array()
        .unique()
        .items(joi.string().regex(/^[0-9]$/)),
      joi.string().regex(/^[0-9]$/)
    )
    // .array()
    // .unique()
    // .items(joi.string().regex(/^[0-9]$/))
    .messages({
      "array.unique": "Cannot register the same class multiple times",
      "string.pattern.base": "Class registered cannot be empty",
      // "string.max": "Class registered cannot be empty",
      "alternatives.match": "Class registered cannot be empty",
    }),
});
// .unknown();

function validateUserCreationBody(req, res, next) {
  const { value, error } = createUserSchema.validate(req.body, validateOpts);

  // check for validation erros
  if (error) {
    console.error(error);

    // get errors
    const errorMessages = error.details.map((detail) => detail.message);

    // errorMessages.forEach(error => {
    //     console.log("error:" + error.message);
    // })

    console.log("error messages debug", errorMessages);

    req.flash("validationErrors", errorMessages);
    return res.redirect("/register");
  }

  console.log("Body Before overwrite: ", req.body);

  // overwrite body with valid data
  req.body = value;

  console.log("Body after overwrite: ", req.body);

  // pass control to next function
  next();
}

/*************************************
 * Validate Login Body
 *************************************/
const loginSchema = joi.object({
  username: joi.string().min(6).token().lowercase().required(),

  password: joi.string().min(8).required(),
});

function validateLoginBody(req, res, next) {
  const { value, error } = loginSchema.validate(req.body, validateOpts);

  // check for validation erros
  if (error) {
    console.error(error);

    // get errors
    const errorMessages = error.details.map((detail) => detail.message);

    // respond with errors
    // return res.status(400).json({"error" : errorMessages});
    console.log("errorMessages: ", errorMessages);
    return res.status(400).render("./login", { errorMessages });
  }

  // overwrite body with valid data
  req.body = value;

  // pass control to next function
  next();
}

module.exports = {
  validateUserCreationBody,
  validateLoginBody,
};
