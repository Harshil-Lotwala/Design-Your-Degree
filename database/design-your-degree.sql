-- Step 0: Create and use database
CREATE DATABASE IF NOT EXISTS DegreePlanner;
USE DegreePlanner;

-- Step 1: Drop tables if they already exist (in FK-safe reverse order)
DROP TABLE IF EXISTS Activities;
DROP TABLE IF EXISTS StudentAbsences;
DROP TABLE IF EXISTS AdvisorMeetings;
DROP TABLE IF EXISTS StudentCourseSelections;
DROP TABLE IF EXISTS UserAcademicOptions;
DROP TABLE IF EXISTS AcademicOptions;
DROP TABLE IF EXISTS DegreePlanComponents;
DROP TABLE IF EXISTS DegreePlans;
DROP TABLE IF EXISTS AcademicYears;
DROP TABLE IF EXISTS Terms;
DROP TABLE IF EXISTS Subjects;
DROP TABLE IF EXISTS Users;
DROP TABLE IF EXISTS Programs;

-- Step 2: Create tables

-- Programs
CREATE TABLE IF NOT EXISTS Programs (
    program_id INT PRIMARY KEY AUTO_INCREMENT,
    program_name VARCHAR(100) NOT NULL
);

-- Users
CREATE TABLE IF NOT EXISTS Users (
    user_id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('Student', 'Advisor') NOT NULL,
    program_id INT,
    security_question_1 VARCHAR(255),
    security_answer_1 VARCHAR(255),
    security_question_2 VARCHAR(255),
    security_answer_2 VARCHAR(255),
    FOREIGN KEY (program_id) REFERENCES Programs(program_id)
);

-- Subjects
CREATE TABLE IF NOT EXISTS Subjects (
    subject_id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    code VARCHAR(20) NOT NULL,
    type ENUM('Core', 'Elective', 'Optional') NOT NULL,
    program_id INT NOT NULL,
    FOREIGN KEY (program_id) REFERENCES Programs(program_id)
);

-- Terms
CREATE TABLE IF NOT EXISTS Terms (
    term_id INT PRIMARY KEY AUTO_INCREMENT,
    term_name VARCHAR(50) NOT NULL
);

-- AcademicYears
CREATE TABLE IF NOT EXISTS AcademicYears (
    year_id INT PRIMARY KEY AUTO_INCREMENT,
    program_id INT NOT NULL,
    year_number INT NOT NULL CHECK (year_number BETWEEN 1 AND 5),
    label VARCHAR(50) NOT NULL,
    FOREIGN KEY (program_id) REFERENCES Programs(program_id)
);

-- DegreePlans
CREATE TABLE IF NOT EXISTS DegreePlans (
    plan_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    plan_name VARCHAR(100) NOT NULL,
    created_on DATE NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (user_id) REFERENCES Users(user_id)
);

-- DegreePlanComponents
CREATE TABLE IF NOT EXISTS DegreePlanComponents (
    component_id INT PRIMARY KEY AUTO_INCREMENT,
    plan_id INT NOT NULL,
    type VARCHAR(50) NOT NULL,
    subject_id INT NOT NULL,
    term_id INT,
    notes TEXT,
    FOREIGN KEY (plan_id) REFERENCES DegreePlans(plan_id),
    FOREIGN KEY (subject_id) REFERENCES Subjects(subject_id),
    FOREIGN KEY (term_id) REFERENCES Terms(term_id)
);

-- AcademicOptions
CREATE TABLE IF NOT EXISTS AcademicOptions (
    option_id INT PRIMARY KEY AUTO_INCREMENT,
    option_type VARCHAR(50) NOT NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    requirements TEXT,
    program_id INT NOT NULL,
    FOREIGN KEY (program_id) REFERENCES Programs(program_id)
);

-- UserAcademicOptions
CREATE TABLE IF NOT EXISTS UserAcademicOptions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    option_id INT NOT NULL,
    added_on DATE NOT NULL,
    status ENUM('Active', 'Completed', 'Dropped'),
    FOREIGN KEY (user_id) REFERENCES Users(user_id),
    FOREIGN KEY (option_id) REFERENCES AcademicOptions(option_id)
);

-- StudentCourseSelections
CREATE TABLE IF NOT EXISTS StudentCourseSelections (
    selection_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    subject_id INT NOT NULL,
    term_id INT NOT NULL,
    is_approved BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (user_id) REFERENCES Users(user_id),
    FOREIGN KEY (subject_id) REFERENCES Subjects(subject_id),
    FOREIGN KEY (term_id) REFERENCES Terms(term_id)
);

-- AdvisorMeetings
CREATE TABLE IF NOT EXISTS AdvisorMeetings (
    meeting_id INT PRIMARY KEY AUTO_INCREMENT,
    student_id INT NOT NULL,
    advisor_id INT NOT NULL,
    notes TEXT,
    meeting_date DATE NOT NULL,
    FOREIGN KEY (student_id) REFERENCES Users(user_id),
    FOREIGN KEY (advisor_id) REFERENCES Users(user_id)
);

-- StudentAbsences
CREATE TABLE IF NOT EXISTS StudentAbsences (
    absence_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    term_id INT NOT NULL,
    is_approved BOOLEAN DEFAULT FALSE,
    notes TEXT,
    FOREIGN KEY (user_id) REFERENCES Users(user_id),
    FOREIGN KEY (term_id) REFERENCES Terms(term_id)
);

-- Activities
CREATE TABLE IF NOT EXISTS Activities (
    activity_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    activity_type ENUM('View', 'Select', 'Submit', 'Advisor_Consult') NOT NULL,
    activity_target VARCHAR(100),
    activity_data TEXT,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES Users(user_id)
);
