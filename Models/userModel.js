"use strict";

const db = require("./db");
const crypto = require("crypto");
const argon2 = require("argon2");
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

  const sql = `INSERT INTO Users values (@userID, @email, @username, @firstName, @lastName, @passwordHash, 0)`;
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

    for (const key in reqBody) {
      if (key.includes("class")) {
        console.log("key:", key, reqBody[key]);
        const courseName = getCourseByCRN(reqBody[key]);
        classesStmt.run({
          userID: userID,
          CRN: reqBody[key],
          courseName: courseName.courseName,
        });
      }
    }
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
  const sql = `SELECT courseName FROM Courses WHERE CRN = @crn`;

  const stmt = db.prepare(sql);
  const courseName = stmt.get({ crn: crn });

  return courseName;
}

module.exports = {
  createUser,
  getUserByUsername,
  getUserByID,
  getallCourses,
  getUserCourses,
  getCourseByCRN,
};
