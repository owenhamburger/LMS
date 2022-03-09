"use strict";

const argon2 = require("argon2");

/*************************************
 * Require Models
 *************************************/
 const userModel = require("../Models/userModel");

// Create new user
async function createNewUser(req, res)  {
    const {email, username, firstName, lastName, password} = req.body;

    const created = await userModel.createUser(email, username, firstName, lastName, password);
        
    // account was succesfully created
    if (created) {
        req.flash('accountCreated', "Account Created Successfully");
        return res.status(201).redirect("/login");
    }
    else {
        const conflictedUser = userModel.getUserByUsername(username);
        if (conflictedUser) {
            req.flash('usernameConflict', "Username already taken");
        }
        else {
            req.flash('emailConflict', "Email already taken");
        }
        
        res.redirect('/register');
    }
}

// Login
async function login(req, res)  {
    // // just assuming that the user can only login with his username (will implement email later)
    // if (!req.body.username || !req.body.password) {
    //     return res.sendStatus(400);
    // }

    let errors = [];

    const {username, password} = req.body;
    const user = userModel.getUserByUsername(username);

    if (!user) {
        errors.push({message: 'Incorrect Username or Password'});
        return res.status(400).render("./login", {errors});
    }

    const {passwordHash} = user;
  
    if (await argon2.verify(passwordHash, password)) {
        req.session.regenerate((err) => {
            if (err){
                console.error(err);
                return res.sendStatus(500); // Internal Server Error
            }

            req.session.user = {};
            req.session.user.username = username;
            req.session.user.userID = user.userID;
            req.session.isLoggedIn = true;

            res.sendStatus(200);
        });
    }
    else {
        return res.sendStatus(400);
    }
}

function checkAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
      return next();
    }
  
    return res.redirect('/login');
  }
  
  function checkNotAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
      return res.redirect('/');
    }

    next();
  }

module.exports = {
    createNewUser,
    login,
    checkAuthenticated, 
    checkNotAuthenticated
};