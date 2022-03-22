"use strict";

const Joi = require("joi");
const { func } = require("joi");
const joi = require("joi");

const validateOpts = {
    abortEarly: false,
    stripUnknown: true,
    errors: {
        escapeHtml: true
    }
};

/*************************************
 * Validate User Creation Body
 *************************************/

const createUserSchema = joi.object({
    username: joi.string()
        .min(6)
        .token()
        .lowercase()
        .required(),

    email: joi.string()
        .email({ 
            minDomainSegments: 2, 
            maxDomainSegments: 3, 
            tlds: { allow: ['edu'] } 
        }),

    firstName: joi.string()
        .min(1)
        .token()
        .required(),

    lastName: joi.string()
        .min(1)
        .token()
        .required(),
    
    password: joi.string()
        .min(8)
        .required(),

    passwordConfirmation: joi.any()
        .equal(joi.ref('password'))
        .required()
        .label('Confirm password')
        .messages({ 'any.only': '{{#label}} does not match' }),

    course_OOP: joi.any(),

    course_Algorithms: joi.any(),

    course_Structured: joi.any(),

    course_Database: joi.any()
});

function validateUserCreationBody(req, res, next) {
    const {value, error} = createUserSchema.validate(req.body, validateOpts);

    // check for validation erros
    if (error) {
        console.error(error);

        // get errors
        const errorMessages = error.details.map(detail => detail.message);

        // respond with errors
        // return res.status(400).json({"error" : errorMessages});

        // errorMessages.forEach(error => {
        //     console.log("error:" + error.message);
        // })

        console.log("error messages debug", errorMessages);

        req.flash('validationErrors', errorMessages);
        return res.redirect('/register');
    }

    // overwrite body with valid data
    req.body = value;

    // pass control to next function 
    next();
}

/*************************************
 * Validate Login Body
 *************************************/
const loginSchema = joi.object({
    username: joi.string()
        .min(6)
        .token()
        .lowercase()
        .required(),
    
    password: joi.string()
        .min(8)
        .required(),
})

function validateLoginBody(req, res, next) {
    const {value, error} = loginSchema.validate(req.body, validateOpts);

    // check for validation erros
    if (error) {
        console.error(error);

        // get errors
        const errorMessages = error.details.map(detail => detail.message);

        // respond with errors
        // return res.status(400).json({"error" : errorMessages});
        console.log("errorMessages: ", errorMessages);
        return res.status(400).render('./login', {errorMessages});
    }

    // overwrite body with valid data
    req.body = value;

    // pass control to next function 
    next();
}

module.exports = {
    validateUserCreationBody,
    validateLoginBody
};