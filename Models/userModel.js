"use strict";

const db = require("./db");
const crypto = require("crypto");
const argon2 = require("argon2");

const adminModel = require("./adminModel");
const { func } = require("joi");

async function createUser(
  email,
  username,
  firstName,
  lastName,
  password,
  reqBody
) {
  let created;
  const userID = crypto.randomUUID();
  const PasswordHash = await argon2.hash(password);

  const sql = `INSERT INTO Users values (@userID, @email, @username, @firstName, @lastName, @passwordHash, 'student')`;
  const classesSql = `INSERT INTO User_Courses values (@userID, @CRN, @courseName)`;

  const stmt = db.prepare(sql);
  const classesStmt = db.prepare(classesSql);

  try {
    stmt.run({
      userID: userID,
      email: email,
      username: username,
      firstName: firstName,
      lastName: lastName,
      passwordHash: PasswordHash,
    });

    for (const registeredClass of reqBody.registeredClasses) {
      console.log(registeredClass);
      const courseName = getCourseByCRN(registeredClass);
      classesStmt.run({
        userID: userID,
        CRN: registeredClass,
        courseName: courseName.courseName,
      });
    }

    // for (const key in reqBody) {
    //   if (key.includes("class")) {
    //     console.log("key:", key, reqBody[key]);
    //     const courseName = getCourseByCRN(reqBody[key]);
    //     classesStmt.run({
    //       userID: userID,
    //       CRN: reqBody[key],
    //       courseName: courseName.courseName,
    //     });
    //   }
    // }
    created = true;
  } catch (err) {
    console.error(err);
    created = false;
  }

  return created;
}

function getUserByUsername(username) {
  const sql = `SELECT * FROM Users WHERE username = @username`;

  const stmt = db.prepare(sql);
  const userRecord = stmt.get({ username });

  return userRecord; // may be undefined
}

function getUserByID(id) {
  const sql = `SELECT * FROM Users WHERE userID = @id`;

  const stmt = db.prepare(sql);
  const userRecord = stmt.get({ id });

  return userRecord; // may be undefined
}

function getallCourses() {
  const sql = `SELECT * FROM Courses`;

  const stmt = db.prepare(sql);
  const allCourses = stmt.all();

  return allCourses;
}

function getUserCourses(id) {
  const sql = `SELECT * FROM User_Courses WHERE userID = @id`;

  const stmt = db.prepare(sql);
  const userCourses = stmt.all({ id });

  return userCourses;
}

function getCourseByCRN(crn) {
  const sql = `SELECT * FROM Courses WHERE CRN = @crn`;

  const stmt = db.prepare(sql);
  const courseName = stmt.get({ crn: crn });

  return courseName;
}

function getUserReservations(userID, crn) {
  const sql = `
  SELECT meetingTime, meetingDate, firstName, lastName 
  FROM reservations 
  JOIN users ON tutorid = users.userid 
  WHERE reservations.userid = @userID AND reservations.crn = @crn;`;

  const stmt = db.prepare(sql);
  const reservations = stmt.all({
    userID: userID,
    crn: crn,
  });

  return reservations;
}

function getSubmittedFile(userID, crn) {
  const sql = `
  SELECT ca.CRN, ca.assessmentType, ca.postedDate, ca.dueDate, ca.assessmentFile, User_Assessments.submittedFile
  FROM Course_Assessments as ca
  LEFT JOIN User_Assessments ON
  userID = @userID AND
  User_Assessments.CRN = ca.CRN 
  AND User_Assessments.assessmentFile = ca.assessmentFile
  `;

  const submittedFile = db.prepare(sql).all({
    userID,
    crn,
  });

  return submittedFile;
}

function submitAssessment(userID, crn, assessmentFile, submittedFile) {
  const sql = `INSERT INTO User_Assessments VALUES (@userID, @crn, @assessmentFile, @submittedFile)`;

  console.log("Model", userID, crn, assessmentFile, submittedFile);

  let inserted;
  try {
    db.prepare(sql).run({
      userID,
      crn,
      assessmentFile,
      submittedFile,
    });
    inserted = true;
  } catch (err) {
    console.log(err);
    inserted = false;
  }

  return inserted;
}

module.exports = {
  createUser,
  getUserByUsername,
  getUserByID,
  getallCourses,
  getUserCourses,
  getCourseByCRN,
  getUserReservations,
  getSubmittedFile,
  submitAssessment,
};
