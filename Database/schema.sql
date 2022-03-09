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

CREATE TABLE IF NOT EXISTS Courses (
    CRN TEXT PRIMARY KEY,
    courseName TEXT NOT NULL 
);

CREATE TABLE IF NOT EXISTS User_Courses (
    userID TEXT,
    CRN TEXT,
    courseName TEXT NOT NULL,

    FOREIGN KEY(userID) REFERENCES Users(userID)
        ON DELETE CASCADE,
    
    FOREIGN KEY (CRN) REFERENCES Courses(CRN)
        ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS Course_Assesments (
    CRN TEXT,
    title TEXT NOT NULL,
    "type" TEXT,
    "description" TEXT,

    PRIMARY KEY(CRN, title, "type"),
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
    Grade Numeric NOT NULL,

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