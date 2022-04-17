"use strict";

require("dotenv").config();

const redis = require("redis");
const session = require("express-session");
const RedisStore = require("connect-redis")(session);
const passport = require("passport");
const flash = require("express-flash");
const methodOverride = require("method-override");
const path = require("path");
const fileUpload = require("express-fileupload");

/*************************************
 * Create App
 *************************************/
const express = require("express");
const app = express();

/*************************************
 * Initialize Session
 *************************************/
const sessionConfig = {
  store: new RedisStore({ client: redis.createClient() }),
  secret: process.env.COOKIE_SECRET,
  resave: false,
  saveUninitialized: false,
  name: "session", // now it is just a generic name
  cookie: {
    httpOnly: true,
    maxAge: 1000 * 60 * 60 * 8, // 8 hours
  },
};

/*************************************
 * Initialize Middleware
 *************************************/
app.use(flash());
app.use(session(sessionConfig));
app.use(passport.initialize());
app.use(passport.session());

const initializePassport = require("./passportConfig");
initializePassport(passport);

app.use(methodOverride("_method"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Make Public folder accessible without defining explicit endpoints
app.use(
  "/public",
  express.static(path.join(__dirname, "Public"), {
    index: false,
    extensions: ["html"],
  })
);

//Enable file upload
app.use(fileUpload());

app.set("view engine", "ejs");
app.set("views", [
  path.join(__dirname, "views"),
  path.join(__dirname, "views/admin"),
  path.join(__dirname, "views/student"),
  path.join(__dirname, "views/tutor"),
]);

/*************************************
 * Require Controllers
 *************************************/
const userController = require("./Controllers/userController.js");
const adminController = require("./Controllers/adminController.js");
const tutorController = require("./Controllers/tutorController.js");

/*************************************
 * Require Validators
 *************************************/
const userValidator = require("./Validators/userValidator");

/*************************************
 * Require Models
 *************************************/
const userModel = require("./Models/userModel");
const adminModel = require("./Models/adminModel");
const tutorModel = require("./Models/tutorModel");

/*************************************
 * Create Endpoints
 *************************************/

app.get("/", userController.checkAuthenticated, (req, res) => {
  // res.redirect("./public/index")
  if (req.user.role == "instructor") {
    res.render("adminDashboard");
  } else {
    res.render("dashboard");
  }
});

//Admin
app.get(
  "/adminCourses",
  userController.checkAuthenticated,
  userController.viewTaughtCourses
);

//Student
app.get(
  "/courses",
  userController.checkAuthenticated,
  userController.viewUserCourses
);

//Admin - View Course
app.get("/adminViewCourse", userController.checkAuthenticated, (req, res) => {
  res.render("adminViewCourse");
});

//Student - View all courses
app.get("/viewCourse", userController.checkAuthenticated, (req, res) => {
  res.render("viewCourse");
});

//Admin - View course by CRN
app.get(
  "/adminViewCourse/:CRN",
  userController.checkAuthenticated,
  (req, res) => {
    res.render("adminViewCourse", {
      courseName: userModel.getCourseByCRN(req.params.CRN),
      CRN: req.params.CRN,
    });
  }
);

//Admin - View Assesments by CRN
app.get(
  "/adminViewAssesments/:CRN",
  userController.checkAuthenticated,
  (req, res) => {
    res.render("adminViewAssesments", {
      courseName: userModel.getCourseByCRN(req.params.CRN),
      CRN: req.params.CRN,
      currentAssessments: adminModel.getCourseAssessments(req.params.CRN),
    });
  }
);

//Admin - View Student submissions for a particular assessment
app.get(
  "/adminViewAssesments/:CRN/:assessment",
  userController.checkAuthenticated,
  (req, res) => {
    console.log(req.params);
    res.render("viewSubmissions", {
      submissions: adminModel.viewSubmissions(
        req.params.CRN,
        req.params.assessment
      ),
      CRN: req.params.CRN,
      courseName: userModel.getCourseByCRN(req.params.CRN),
    });
  }
);

//Student - View Assesments by CRN
app.get("/viewCourse/:CRN", userController.checkAuthenticated, (req, res) => {
  res.render("viewCourse", {
    courseName: userModel.getCourseByCRN(req.params.CRN),
    role: req.user.role,
  });
});

//Student
app.get("/register", userController.checkNotAuthenticated, (req, res) => {
  res.render("register.ejs", { allCourses: userModel.getallCourses() });
});

//Student
app.post(
  "/register",
  userController.checkNotAuthenticated,
  userValidator.validateUserCreationBody,
  userController.createNewUser
);

//Admin & Student
app.get("/login", userController.checkNotAuthenticated, (req, res) => {
  res.render("login");
});

//Admin & Student
app.post(
  "/login",
  userController.checkNotAuthenticated,
  passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/login",
    failureFlash: true,
  })
);

//Admin & Student
app.get("/logout", (req, res) => {
  req.logOut();
  req.flash("logOutSuccess", "Log Out Successful");
  res.redirect("/login");
});

// View assessments
app.get(
  "/viewCourse/:CRN/assessments",
  userController.checkAuthenticated,
  (req, res) => {
    res.render("assessments", {
      currentAssessments: userModel.getSubmittedFile(
        req.user.userID,
        req.params.CRN
      ),
      CRN: req.params.CRN,
      courseName: userModel.getCourseByCRN(req.params.CRN),
      role: req.user.role,
    });
  }
);

// student submit assessment
app.post(
  "/viewCourse/:CRN/assessments",
  userController.checkAuthenticated,
  userController.submitAssessment
);

// View materials
app.get(
  "/viewCourse/:CRN/materials",
  userController.checkAuthenticated,
  (req, res) => {
    res.render("materials", {
      courseName: userModel.getCourseByCRN(req.params.CRN),
      role: req.user.role,
    });
  }
);

// View chat page
app.get(
  "/viewCourse/:CRN/chat",
  userController.checkAuthenticated,
  (req, res) => {
    res.render("chat", {
      courseName: userModel.getCourseByCRN(req.params.CRN),
      role: req.user.role,
    });
  }
);

// View user reservations
app.get(
  "/viewCourse/:CRN/tutorReservation",
  userController.checkAuthenticated,
  (req, res) => {
    if (req.user.role === "student") {
      res.render("selectTutor", {
        courseName: userModel.getCourseByCRN(req.params.CRN),
        tutors: tutorModel.getTutorsByCRN(req.params.CRN),
        reservations: userModel.getUserReservations(
          req.user.userID,
          req.params.CRN
        ),
      });
    } else {
      res.redirect(`/viewCourse/${req.params.CRN}`);
    }
  }
);

// view tutor reservations
app.get(
  "/tutor/tutorReservation",
  userController.checkAuthenticated,
  (req, res) => {
    res.render("viewReservations", {
      reservations: tutorModel.viewTutorReservations(req.user.userID),
    });
  }
);

// View tutor's available times
app.get(
  "/viewCourse/:CRN/tutorReservation/:selectedTutorID",
  userController.checkAuthenticated,
  (req, res) => {
    if (req.user.role === "student") {
      res.render("tutorInfo", {
        courseName: userModel.getCourseByCRN(req.params.CRN),
        tutorSchedule: tutorModel.getTutorSchedule(req.params.selectedTutorID),
        tutorReservations: tutorModel.getTutorReservations(
          req.params.selectedTutorID
        ),
        tutorID: req.params.selectedTutorID,
        /*CRN: req.params.CRN*/
      });
    } else {
      res.redirect(`/viewCourse/${req.params.CRN}`);
    }
  }
);

// reserve tutor
app.post(
  "/viewCourse/:CRN/tutorReservation/:selectedTutorID",
  userController.checkAuthenticated,
  (req, res) => {
    if (req.user.role === "student") {
      tutorController.tutorReservation(
        req,
        res,
        req.params.CRN,
        req.params.selectedTutorID
      );
    } else {
      res.redirect(`/viewCourse/${req.params.CRN}`);
    }
  }
);

// Tutor Reservation Summary
app.get(
  "/viewCourse/:CRN/tutorReservation/tutorInfo/summary",
  userController.checkAuthenticated,
  (req, res) => {
    res.render("summary", {
      courseName: userModel.getCourseByCRN(req.params.CRN),
      /*CRN: req.params.CRN*/
    });
  }
);

// summary to course page
app.get(
  "/viewCourse/:CRN/tutorReservation/tutorInfo/summary/course",
  userController.checkAuthenticated,
  (req, res) => {
    res.render("course", {
      courseName: userModel.getCourseByCRN(req.params.CRN),
      /*CRN: req.params.CRN*/
    });
  }
);

// View grades
app.get(
  "/viewCourse/:CRN/grades",
  userController.checkAuthenticated,
  (req, res) => {
    res.render("grades", {
      courseName: userModel.getCourseByCRN(req.params.CRN),
      role: req.user.role,
    });
  }
);

//File upload
app.post(
  "/adminViewAssesments/:CRN",
  userController.checkAuthenticated,
  adminController.uploadAssessment
);

module.exports = app;
