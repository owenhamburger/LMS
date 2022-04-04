-- Will add the chat_port attribute later
CREATE TABLE IF NOT EXISTS Users (
    userID TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    username TEXT UNIQUE NOT NULL,
    firstName TEXT NOT NULL,
    lastName TEXT NOT NULL,
    passwordHash TEXT NOT NULL,
    --chatPort NUMERIC,
    isTeacher BOOLEAN
);

-- INSERT into courses values ('1', 'Concepts of Programming');
-- INSERT into courses values ('2', 'Structured Programming');
-- INSERT into courses values ('3', 'Object Oriented Programming');
-- INSERT into courses values ('4', 'Algorithms and Data Structure');
-- INSERT into courses values ('5', 'Operating Systems');
-- INSERT into courses values ('6', 'Computer Networks');

CREATE TABLE IF NOT EXISTS Courses (
    CRN TEXT PRIMARY KEY,
    courseName TEXT NOT NULL 
);

--For admin users test dummy data
--INSERT INTO User_Courses values("1", "3", "Object Oriented Programming");
--INSERT INTO User_Courses values("1234", "3", "Structured Programming");
CREATE TABLE IF NOT EXISTS User_Courses (
    userID TEXT,
    CRN TEXT,
    courseName TEXT NOT NULL,

    FOREIGN KEY(userID) REFERENCES Users(userID)
        ON DELETE CASCADE,
    
    FOREIGN KEY (CRN) REFERENCES Courses(CRN)
        ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS Course_Assessments (
    CRN TEXT,
    assessmentType TEXT,
    postedDate INT,
    dueDate INT,
    assessmentFile TEXT,
    -- submittedFile TEXT,

    PRIMARY KEY(CRN, assessmentType, assessmentFile),
    FOREIGN KEY(CRN) REFERENCES Courses(CRN)    
);

CREATE TABLE IF NOT EXISTS User_Assessments (
    userID TEXT,
    CRN TEXT,
    -- assessmentType TEXT,
    -- postedDate INT,
    -- dueDate INT,
    assessmentFile TEXT,
    submittedFile TEXT,

    PRIMARY KEY(userID, CRN, assessmentFile, submittedFile),
    FOREIGN KEY(userID) REFERENCES users(userID),
    FOREIGN KEY(CRN) REFERENCES Courses(CRN)    
);

CREATE TABLE IF NOT EXISTS Course_Materials (
    CRN TEXT,
    filePath TEXT,
    title TEXT,

    PRIMARY KEY (filePath),
    FOREIGN KEY(CRN) REFERENCES Courses(CRN)
);

CREATE TABLE IF NOT EXISTS Course_Announcements (
    CRN TEXT,
    announcement TEXT NOT NULL,

    FOREIGN KEY(CRN) REFERENCES Courses(CRN)
);

CREATE TABLE IF NOT EXISTS Student_Grades (
    userID TEXT,
    CRN TEXT,
    title TEXT,
    "type" TEXT,
    grade Numeric NOT NULL,

    PRIMARY KEY(userID, CRN, title, "type"),

    FOREIGN KEY(userID) REFERENCES Users(userID)
        ON DELETE CASCADE,

    FOREIGN KEY(title, "type") REFERENCES Course_Assesments(title, "type"),
    FOREIGN KEY(CRN)           REFERENCES Courses(CRN)
);

CREATE TABLE IF NOT EXISTS Reservations (
    userID TEXT,
    tutorID TEXT,
    CRN TEXT,
    "time" TEXT NOT NULL,
    "date" TEXT NOT NULL,

    FOREIGN KEY(userID) REFERENCES Users(userID)
        ON DELETE CASCADE,

    FOREIGN KEY(tutorID) REFERENCES Users(userID)
        ON DELETE CASCADE,

    FOREIGN KEY(CRN) REFERENCES Courses(CRN)
);

CREATE TABLE IF NOT EXISTS Chats (
    sendingUserID TEXT,
    recievingUserID TEXT,
    "message" TEXT NOT NULL ,
    CRN TEXT,

    FOREIGN KEY(sendingUserID) REFERENCES Users(userID)
        ON DELETE CASCADE,

    FOREIGN KEY(recievingUserID) REFERENCES Users(userID)
        ON DELETE CASCADE,

    FOREIGN KEY(CRN) REFERENCES Courses(CRN)
);