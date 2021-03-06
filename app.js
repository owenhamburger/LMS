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
const multer = require("multer");
const crypto = require("crypto");
var fs = require("fs");
// const nodemailer = require("nodemailer");

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

// Enable File Upload (admin -- assessments)
const assessmentMulter = multer({
  storage: multer.diskStorage({
    destination(req, file, cb) {
      cb(
        null,
        `./Files/${req.params.CRN}/assessments/${req.body.assessmentType}`
      );
    },

    filename(req, file, cb) {
      // Generate a random name
      const randomName = crypto.randomBytes(15).toString("hex");

      // Parse the extension from the file's original name
      const [extension] = file.originalname.split(".").slice(-1);

      // Now the random name preserves the file extension
      cb(null, `${randomName}.${extension}`);
    },
  }),
  fileFilter(req, file, cb) {
    if (!req.session && req.session.role !== "admin") {
      return cb(null, false); // reject
    }
    return cb(null, true);
  },
});

// Enable File Upload (admin -- materials)
const materialMulter = multer({
  storage: multer.diskStorage({
    destination(req, file, cb) {
      cb(null, `./Files/${req.params.CRN}/materials`);
    },

    filename(req, file, cb) {
      // Generate a random name
      const randomName = crypto.randomBytes(15).toString("hex");

      // Parse the extension from the file's original name
      const [extension] = file.originalname.split(".").slice(-1);

      // Now the random name preserves the file extension
      cb(null, `${randomName}.${extension}`);
    },
  }),
  fileFilter(req, file, cb) {
    if (!req.session && req.session.role !== "admin") {
      return cb(null, false); // reject
    }
    return cb(null, true);
  },
});

// Enable File Upload (student -- submission)
const submitMulter = multer({
  storage: multer.diskStorage({
    destination(req, file, cb) {
      const assessmentType = req.body.assessment.split("/")[3];
      const assessmentName = req.body.assessment.split("/")[5];

      if (
        !fs.existsSync(
          `./Files/${req.params.CRN}/submissions/${assessmentType}/${assessmentName}`
        )
      ) {
        fs.mkdirSync(
          `./Files/${req.params.CRN}/submissions/${assessmentType}/${assessmentName}`
        );
      }

      cb(
        null,
        `./Files/${req.params.CRN}/submissions/${assessmentType}/${assessmentName}`
      );
    },

    filename(req, file, cb) {
      const randomName = crypto.randomBytes(15).toString("hex");
      const [extension] = file.originalname.split(".").slice(-1);
      cb(null, `${randomName}.${extension}`);
    },
  }),
  fileFilter(req, file, cb) {
    if (
      (!req.session && req.session.role !== "student") ||
      (!req.session && req.session.role !== "tutor")
    ) {
      return cb(null, false); // reject
    }
    return cb(null, true);
  },
});

// app.use(fileUpload());

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
const emailController = require("./Controllers/emailController.js");

/*************************************
 * Require Validators
 *************************************/
const userValidator = require("./Validators/userValidator");
const tutorValidator = require("./Validators/tutorValidator");

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
  if (req.user.role == "admin") {
    res.render("adminDashboard", {
      profile: adminModel.getAdminInfo(req.user.userID),
    });
  } else if (req.user.role == "tutor") {
    res.render("tutorDashboard", {
      profile: adminModel.getAdminInfo(req.user.userID),
    });
  } else {
    res.render("dashboard", {
      profile: adminModel.getAdminInfo(req.user.userID),
    });
  }
});

//Admin
app.get(
  "/adminCourses",
  userController.checkAuthenticated,
  adminController.validateAdmin,
  userController.viewTaughtCourses
);

//Student
app.get(
  "/courses",
  userController.checkAuthenticated,
  userController.validateUser,
  userController.viewUserCourses
);

//Admin - View Course
app.get(
  "/adminViewCourse",
  userController.checkAuthenticated,
  adminController.validateAdmin,
  (req, res) => {
    res.render("adminViewCourse");
  }
);

//Student - View all courses
app.get(
  "/viewCourse",
  userController.checkAuthenticated,
  userController.validateUser,
  (req, res) => {
    res.render("viewCourse");
  }
);

//Admin - View course by CRN
app.get(
  "/adminViewCourse/:CRN",
  userController.checkAuthenticated,
  adminController.validateAdmin,
  (req, res) => {
    res.render("adminViewCourse", {
      courseName: userModel.getCourseByCRN(req.params.CRN),
      CRN: req.params.CRN,
    });
  }
);

//Admin - View Assesments by CRN
app.get(
  "/adminViewCourse/:CRN/adminViewAssessments",
  userController.checkAuthenticated,
  adminController.validateAdmin,
  (req, res) => {
    res.render("adminViewAssesments", {
      courseName: userModel.getCourseByCRN(req.params.CRN),
      CRN: req.params.CRN,
      currentAssessments: adminModel.getCourseAssessments(req.params.CRN),
    });
  }
);

app.get(
  "/adminViewCourse/:CRN/adminMaterials",
  userController.checkAuthenticated,
  (req, res) => {
    res.render("adminMaterials", {
      courseName: userModel.getCourseByCRN(req.params.CRN),
      CRN: req.params.CRN,
      role: req.user.role,
      materials: adminModel.getCourseMaterials(req.params.CRN),
    });
  }
);

app.get(
  "/adminViewCourse/:CRN/adminGrades",
  userController.checkAuthenticated,
  (req, res) => {
    res.render("adminGrades", {
      courseName: userModel.getCourseByCRN(req.params.CRN),
      CRN: req.params.CRN,
      role: req.user.role,
    });
  }
);

//Admin - View Student submissions for a particular assessment
app.get(
  "/adminViewAssesments/:CRN/:assessmentName/:assessmentType",
  userController.checkAuthenticated,
  adminController.validateAdmin,
  (req, res) => {
    res.render("viewSubmissions", {
      submissions: adminModel.viewSubmissions(
        req.params.CRN,
        req.params.assessmentName,
        req.params.assessmentType
      ),
      CRN: req.params.CRN,
      courseName: userModel.getCourseByCRN(req.params.CRN),
    });
  }
);

// Update grade for a student submission
app.post(
  "/updateGrade",
  userController.checkAuthenticated,
  adminController.updateGrade
);

// Admin file upload (assessment)
app.post(
  "/adminViewCourse/:CRN/adminViewAssessments",
  userController.checkAuthenticated,
  adminController.validateAdmin,
  assessmentMulter.single("inputFile"),
  adminController.uploadAssessment
);

// Admin file upload (material)
app.post(
  "/adminViewCourse/:CRN/adminMaterials",
  userController.checkAuthenticated,
  adminController.validateAdmin,
  materialMulter.single("inputFile"),
  adminController.uploadMaterial
);

// make files from "Files" folder accessible (assessments)
app.get(
  "/files/:CRN/assessments/:type/:file",
  userController.checkAuthenticated,
  (req, res) => {
    res.sendFile(
      __dirname +
        `/Files/${req.params.CRN}/assessments/${req.params.type}/${req.params.file}`
    );
  }
);

// make files from "Files" folder accessible (materials)
app.get(
  "/files/:CRN/materials/:file",
  userController.checkAuthenticated,
  (req, res) => {
    res.sendFile(
      __dirname + `/Files/${req.params.CRN}/materials/${req.params.file}`
    );
  }
);

// make files from "Files" folder accessible (submissions)
app.get(
  "/files/:CRN/submissions/:type/:name/:file",
  userController.checkAuthenticated,
  (req, res) => {
    res.sendFile(
      __dirname +
        `/Files/${req.params.CRN}/submissions/${req.params.type}/${req.params.name}/${req.params.file}`
    );
  }
);

//Student - View Assesments by CRN
app.get(
  "/viewCourse/:CRN",
  userController.checkAuthenticated,
  userController.validateUser,
  (req, res) => {
    res.render("viewCourse", {
      courseName: userModel.getCourseByCRN(req.params.CRN),
      role: req.user.role,
    });
  }
);

//Student
app.get("/register", userController.checkNotAuthenticated, (req, res) => {
  res.render("register.ejs", { allCourses: userModel.getallCourses() });
});

//Student
app.post(
  "/register",
  userController.checkNotAuthenticated,
  userValidator.validateUserCreationBody,
  userController.createNewUser,
  emailController.sendRegistrationEmail
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
  userController.validateUser,
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
  userController.validateUser,
  submitMulter.single("inputFile"),
  userController.submitAssessment,
  emailController.sendSubmissionConfirmation
);

// View materials
app.get(
  "/viewCourse/:CRN/materials",
  userController.checkAuthenticated,
  userController.validateUser,
  (req, res) => {
    res.render("materials", {
      courseName: userModel.getCourseByCRN(req.params.CRN),
      role: req.user.role,
      materials: adminModel.getCourseMaterials(req.params.CRN),
    });
  }
);

// View user reservations
app.get(
  "/viewCourse/:CRN/tutorReservation",
  userController.checkAuthenticated,
  userController.validateUser,
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
  userController.validateUser,
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
  userController.validateUser,
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
  tutorValidator.validateReservation,
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
  userController.validateUser,
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
  userController.validateUser,
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
  userController.validateUser,
  (req, res) => {
    res.render("grades", {
      courseName: userModel.getCourseByCRN(req.params.CRN),
      role: req.user.role,
      homeworkGrades: userModel.getGradesOfType(
        req.user.userID,
        req.params.CRN,
        "homework"
      ),
      quizGrades: userModel.getGradesOfType(
        req.user.userID,
        req.params.CRN,
        "quiz"
      ),
      examGrades: userModel.getGradesOfType(
        req.user.userID,
        req.params.CRN,
        "exam"
      ),
    });
  }
);

module.exports = app;
