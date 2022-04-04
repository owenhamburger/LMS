"use strict";

const db = require("./db");

function insertAssessment(crn, assessmentType, filePath, dueDate, postedDate) {
  let created;
  const sql = `INSERT INTO Course_Assessments VALUES(@crn, @assessmentType, @postedDate, @dueDate, @filePath)`;
  const stmt = db.prepare(sql);

  try {
    stmt.run({
      crn,
      assessmentType,
      postedDate,
      dueDate,
      filePath,
    });
    created = true;
  } catch (err) {
    console.error(err);
    created = false;
  }

  return created;
}

function getCourseAssessments(crn) {
  const sql = `SELECT * FROM Course_Assessments WHERE CRN = @crn`;
  const assessments = db.prepare(sql).all({
    crn,
  });

  return assessments;
}

function viewSubmissions(crn, assessmentFile) {
  const sql = `
  SELECT userID, submittedFile 
  FROM User_Assessments 
  WHERE crn = @crn AND assessmentFile = @assessmentFile
  `;

  const submissions = db.prepare(sql).all({
    crn,
    assessmentFile,
  });

  console.log(crn, assessmentFile);

  console.log("Sub: ", submissions);

  return submissions;
}

module.exports = {
  insertAssessment,
  getCourseAssessments,
  viewSubmissions,
};
