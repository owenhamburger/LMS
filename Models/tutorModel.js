"use strict";

const db = require("./db");
const crypto = require("crypto");
const argon2 = require("argon2");

function getTutorsByCRN(crn) {
  const sql = `
    SELECT DISTINCT tutorID, firstName, lastName 
    FROM users
    JOIN tutor_courses ON userID = tutorID and crn = @crn
    `;

  const stmt = db.prepare(sql);
  const tutors = stmt.all({ crn: crn });

  return tutors;
}

function getTutorSchedule(tutorID) {
  const sql = `
    SELECT meetingTime, dayOfWeek 
    FROM Tutor_Schedule
    WHERE tutorID = @tutorID`;

  const stmt = db.prepare(sql);
  const tutorSchedule = stmt.all({
    tutorID: tutorID,
  });

  return tutorSchedule;
}

function getTutorReservations(tutorID) {
  const sql = `
    SELECT meetingTime, meetingDate 
    FROM Reservations
    WHERE tutorID = @tutorID`;

  const stmt = db.prepare(sql);
  const tutorReservations = stmt.all({
    tutorID: tutorID,
  });

  return tutorReservations;
}

// same as getTutorReservations but attaches tutor first + last name
function viewTutorReservations(tutorID) {
  const sql = `
    SELECT firstName, lastName, meetingTime, meetingDate, courseName
    FROM Reservations
    JOIN Users ON reservations.userID = Users.userID
    JOIN Courses on reservations.crn = courses.crn
    WHERE reservations.tutorID = @tutorID`;

  const stmt = db.prepare(sql);
  const tutorReservations = stmt.all({
    tutorID,
    // crn,
  });

  return tutorReservations;
}

function reserveTutor(userID, tutorID, crn, meetingTime, meetingDate) {
  const sql = `
    INSERT INTO Reservations 
    VALUES (@userID, @tutorID, @crn, @meetingTime, @meetingDate)`;

  const stmt = db.prepare(sql);
  let reserved = {};
  try {
    stmt.run({
      userID,
      tutorID,
      crn,
      meetingTime,
      meetingDate,
    });
    reserved.reserved = true;
  } catch (err) {
    reserved.reserved = false;
    reserved.err = err.code;
    console.error(err);
  }

  return reserved;
}

module.exports = {
  getTutorsByCRN,
  getTutorSchedule,
  getTutorReservations,
  viewTutorReservations,
  reserveTutor,
};
