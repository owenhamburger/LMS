"use strict";

const db = require("./db");

function insertAssessment(
  crn,
  assessmentName,
  assessmentType,
  postedDate,
  dueDate,
  assessmentFile
) {
  let created;
  const sql = `
  INSERT INTO Course_Assessments 
  VALUES(@crn, @assessmentName, @assessmentType, @postedDate, @dueDate, @assessmentFile)
  `;
  const stmt = db.prepare(sql);

  try {
    stmt.run({
      crn,
      assessmentName,
      assessmentType,
      postedDate,
      dueDate,
      assessmentFile,
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

function viewSubmissions(crn, assessmentName, assessmentType) {
  const sql = `
  SELECT User_Assessments.userID, firstName, lastName, submittedFile, originalFileName, assessmentName, assessmentType, grade 
  FROM User_Assessments
  JOIN Users on users.userid = User_Assessments.userid
  WHERE crn = @crn 
  AND assessmentName = @assessmentName
  AND assessmentType = @assessmentType
  `;

  const submissions = db.prepare(sql).all({
    crn,
    assessmentName,
    assessmentType,
  });

  // console.log(crn, assessmentFile);

  return submissions;
}

function updateGrade(userID, crn, assessmentName, assessmentType, grade) {
  const sql = `
  UPDATE user_assessments
  SET grade = @grade
  WHERE userID = @userID
  AND crn = @crn
  AND assessmentName = @assessmentName
  AND assessmentType = @assessmentType
  `;

  const stmt = db.prepare(sql);
  let updated;
  try {
    stmt.run({
      grade,
      userID,
      crn,
      assessmentName,
      assessmentType,
    });
    updated = true;
  } catch (err) {
    updated = false;
    console.error(err);
  }

  return updated;
}

module.exports = {
  insertAssessment,
  getCourseAssessments,
  viewSubmissions,
  updateGrade,
};
