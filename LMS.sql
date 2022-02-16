CREATE TABLE "Course_Materials" (
  "CRN" TEXT,
  "File" TEXT,
  "Title" TEXT,
  PRIMARY KEY ("File")
);

CREATE TABLE "Courses" (
  "CRN" TEXT,
  "Course_Name" TEXT,
  PRIMARY KEY ("CRN")
);

CREATE TABLE "Instructors" (
  "Email" TEXT,
  "First_Name" TEXT,
  "Last_Name" TEXT,
  "Username" TEXT,
  "Password" TEXT,
  PRIMARY KEY ("Email")
);

CREATE TABLE "Instructor_Courses" (
  "CRN" TEXT,
  "Instructor_Email" TEXT,
  "Course_Name" TEXT,
  CONSTRAINT "FK_Instructor_Courses.CRN"
    FOREIGN KEY ("CRN")
      REFERENCES "Courses"("CRN"),
  CONSTRAINT "FK_Instructor_Courses.Instructor_Email"
    FOREIGN KEY ("Instructor_Email")
      REFERENCES "Instructors"("Email")
);

CREATE TABLE "Students" (
  "Email" TEXT,
  "First_Name" TEXT,
  "Last_Name" TEXT,
  "Username" TEXT UNIQUE,
  "Password" TEXT,
  "Chat_Port" NUMERIC,
  PRIMARY KEY ("Email")
);

CREATE TABLE "Chats" (
  "Sending_User" TEXT,
  "Recieving_User" TEXT,
  "Message" TEXT,
  "CRN" TEXT
);

CREATE TABLE "Course_Assesments" (
  "CRN" TEXT UNIQUE,
  "Title" TEXT,
  "Type" TEXT,
  "Description" TEXT,
  PRIMARY KEY ("Title", "Type")
);

CREATE TABLE "Student_Grades" (
  "Student_Email" TEXT,
  "Course" TEXT,
  "Title" TEXT,
  "Type" TEXT,
  "Grade" Numeric,
  CONSTRAINT "FK_Student_Grades.Course"
    FOREIGN KEY ("Course")
      REFERENCES "Course_Assesments"("CRN")
);

CREATE TABLE "Student_Courses" (
  "CRN" TEXT,
  "Student_Email" TEXT,
  "Course_Name" TEXT,
  CONSTRAINT "FK_Student_Courses.Student_Email"
    FOREIGN KEY ("Student_Email")
      REFERENCES "Students"("Username"),
  CONSTRAINT "FK_Student_Courses.CRN"
    FOREIGN KEY ("CRN")
      REFERENCES "Courses"("CRN")
);

CREATE TABLE "Course_Announcements" (
  "CRN" TEXT,
  "Announcement" TEXT
);

