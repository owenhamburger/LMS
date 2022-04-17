"use strict";

require("dotenv").config();
const db = require("../Models/db");

/***********************************************************************************
This function is made to insert default values automatically into the database whenever the server fires up
Data include:
    - tutor users
    - tutor schedule
    - admin user
    - courses
    
Notes:
    - the password for all tutor/admin accounts is 111111
    - if the data is already in the database, the insert statement will simply be ignored
***********************************************************************************/

function insertDefaultData() {
  /*****************************
   * Course Data
   ****************************/
  const courses = [
    {
      CRN: "1",
      courseName: "Concepts of Programming",
    },

    {
      CRN: "2",
      courseName: "Structured Programming",
    },

    {
      CRN: "3",
      courseName: "Object Oriented Programming",
    },

    {
      CRN: "4",
      courseName: "Algorithms and Data Structure",
    },

    {
      CRN: "5",
      courseName: "Operating Systems",
    },

    {
      CRN: "6",
      courseName: "Computer Networks",
    },
  ];

  const coursesSql = db.prepare(
    `INSERT OR IGNORE INTO Courses 
      VALUES (@CRN, @courseName)`
  );

  courses.forEach((course) => {
    coursesSql.run({
      CRN: course.CRN,
      courseName: course.courseName,
    });
  });

  /*****************************
   * Tutor accounts & schedules
   ****************************/
  const tutors = [
    {
      userID: "26fa76f2-9b99-9df6-865f-6e134970c251",
      email: "tutor1@a.edu",
      username: "tutor1",
      firstName: "Fared",
      lastName: "Farag",
      passwordHash:
        "$argon2i$v=19$m=12,t=3,p=1$aGhpajZlbzNsODYwMDAwMA$kplUMQYrYL/jKseOeE1uUA",
      CRN: ["1", "2"],
      registeredCRN: [
        {
          CRN: "4",
          courseName: "Algorithms and Data Structure",
        },

        {
          CRN: "6",
          courseName: "Computer Networks",
        },
      ],
    },

    {
      userID: "66fa76f2-9b99-5bd2-865f-6e134970c252",
      email: "tutor2@a.edu",
      username: "tutor2",
      firstName: "Owen",
      lastName: "Habeger",
      passwordHash:
        "$argon2i$v=19$m=12,t=3,p=1$cGpjc2hodTZ4dnEwMDAwMA$G4t35TQ9Hi2jr34giPzgCg",
      CRN: ["1", "3"],
      registeredCRN: [
        {
          CRN: "4",
          courseName: "Algorithms and Data Structure",
        },

        {
          CRN: "5",
          courseName: "Operating Systems",
        },
      ],
    },

    {
      userID: "36fa76f2-9b99-7bi3-865f-6e134970c253",
      email: "tutor3@a.edu",
      username: "tutor3",
      firstName: "Amine",
      lastName: "Ghoorchiyani",
      passwordHash:
        "$argon2i$v=19$m=12,t=3,p=1$NDZianc3MHdrdDMwMDAwMA$P2f1Usl2tbwoAr1m5xWK+w",
      CRN: ["2", "3"],
      registeredCRN: [
        {
          CRN: "5",
          courseName: "Operating Systems",
        },

        {
          CRN: "6",
          courseName: "Computer Networks",
        },
      ],
    },
  ];

  const tutorScheduleTimes = [
    "09:00-10:00 am",
    "11:00-12:00 pm",
    "01:00-02:00 pm",
    "02:00-03:00 pm",
  ];

  const tutorScheduleDays = [
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
  ];

  const tutorAccountsSql = db.prepare(
    `INSERT OR IGNORE INTO Users 
      VALUES (@userID, @email, @username, @firstName, @lastName, @passwordHash, 'tutor')`
  );

  const tutorScheduleSql = db.prepare(
    `INSERT OR IGNORE INTO Tutor_Schedule
      VALUES (@tutorID, @meetingTime, @dayOfWeek)`
  );

  const tutorCoursesSql = db.prepare(
    `INSERT OR IGNORE INTO Tutor_Courses
    VALUES (@tutorID, @CRN)`
  );

  const tutorRegisteredCoursesSql = db.prepare(
    `INSERT OR IGNORE INTO User_Courses
    VALUES (@userID, @crn, @courseName)`
  );

  tutors.forEach((tutor) => {
    // create account
    tutorAccountsSql.run({
      userID: tutor.userID,
      email: tutor.email,
      username: tutor.username,
      firstName: tutor.firstName,
      lastName: tutor.lastName,
      passwordHash: tutor.passwordHash,
    });

    // add tutor's registered courses
    tutor.CRN.forEach((crn) => {
      tutorCoursesSql.run({
        tutorID: tutor.userID,
        CRN: crn,
      });
    });

    // add tutor's courses (that he/she teaches)
    tutor.registeredCRN.forEach((crn) => {
      tutorRegisteredCoursesSql.run({
        userID: tutor.userID,
        crn: crn.CRN,
        courseName: crn.courseName,
      });
    });

    // add tutor's schedule for tutoring
    tutorScheduleDays.forEach((day) => {
      tutorScheduleTimes.forEach((time) => {
        console.log("TUTOR: ", tutor, time, day);
        tutorScheduleSql.run({
          tutorID: tutor.userID,
          meetingTime: time,
          dayOfWeek: day,
        });
      });
    });
  });

  // tutors.forEach((tutor) => {});

  /*****************************
   * Admin account
   ****************************/
  const admins = [
    {
      userID: "36fa28f2-9b77-7bi3-865f-6e190123c253",
      email: "admin1@a.edu",
      username: "admin1",
      firstName: "Fared",
      lastName: "Farag",
      passwordHash:
        "$argon2i$v=19$m=12,t=3,p=1$enlicjgwMWtqdHMwMDAwMA$4oHsrosuDTaKQ6tBqizepA",
    },
  ];

  const adminAccountSql = db.prepare(
    `INSERT OR IGNORE INTO Users 
    VALUES (@userID, @email, @username, @firstName, @lastName, @passwordHash, 'admin')`
  );

  const adminCoursesSql = db.prepare(
    `INSERT OR IGNORE INTO User_Courses
      VALUES(@userID, @CRN, @courseName)`
  );

  admins.forEach((admin) => {
    adminAccountSql.run({
      userID: admin.userID,
      email: admin.email,
      username: admin.username,
      firstName: admin.firstName,
      lastName: admin.lastName,
      passwordHash: admin.passwordHash,
    });

    courses.forEach((course) => {
      adminCoursesSql.run({
        userID: admin.userID,
        CRN: course.CRN,
        courseName: course.courseName,
      });
    });
  });
}

insertDefaultData();
