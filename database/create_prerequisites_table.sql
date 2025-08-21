-- ✅ Create Subjects Table
INSERT INTO Subjects (name, code, type, program_id) VALUES
('Intro to Computer Science', 'CSCI 1110', 'Core', 1),
('Intro to Computer Systems', 'CSCI 1120', 'Core', 1),
('Intro to Web Design and Dev', 'CSCI 1170', 'Core', 1),
('Science and Technology 1', 'ASSC 1800', 'Core', 1),
('Science and Technology 2', 'ASSC 1801', 'Core', 1),
('Comm. Skills for Co-op', 'CSCI 2100', 'Core', 1),
('Data Structures and Algorithms', 'CSCI 2110', 'Core', 1),
('Software Development', 'CSCI 2134', 'Core', 1),
('Intro to Database Systems', 'CSCI 2141', 'Core', 1),
('Server Side Scripting', 'CSCI 2170', 'Core', 1),
('Information Security', 'CSCI 2201', 'Core', 1),
('Intro. to Software Projects', 'CSCI 2690', 'Core', 1),
('Introductory Project', 'CSCI 2691', 'Core', 1),
('Soc., Ethics & Prof. Issues', 'CSCI 3101', 'Core', 1),
('Software Engineering', 'CSCI 3130', 'Core', 1),
('Design User Interfaces', 'CSCI 3160', 'Core', 1),
('Network Computing', 'CSCI 3171', 'Core', 1),
('Web-Centric Computing', 'CSCI 3172', 'Core', 1),
('Intermediate Project', 'CSCI 3691', 'Core', 1),
('Human-Computer Interaction', 'CSCI 4163', 'Core', 1),
('Fourth-year DB Course', 'CSCI 414X', 'Core', 1),
('Advanced Project', 'CSCI 4691', 'Core', 1),
('Multidisciplinary Mgmt 1', 'MGMT 1301', 'Core', 1),
('Multidisciplinary Mgmt 2', 'MGMT 1302', 'Core', 1),
('Micro-Org Behaviour', 'MGMT 2303', 'Core', 1),
('MGMT Elective', 'MGMT 2801', 'Elective', 1),
('Introductory Psychology II', 'PSYO 1012', 'Elective', 1),
('Probability and Statistics', 'STAT 1010', 'Elective', 1);

-- ✅ Create Prerequisites Table
CREATE TABLE IF NOT EXISTS Prerequisites (
    id INT PRIMARY KEY AUTO_INCREMENT,
    course_id INT NOT NULL,
    required_course_id INT NOT NULL,
    FOREIGN KEY (course_id) REFERENCES Subjects(subject_id) ON DELETE CASCADE,
    FOREIGN KEY (required_course_id) REFERENCES Subjects(subject_id) ON DELETE CASCADE
);

-- CSCI 2100: ASSC 1800, ASSC 1801
INSERT INTO Prerequisites (course_id, required_course_id)
VALUES
((SELECT subject_id FROM Subjects WHERE code = 'CSCI 2100'), (SELECT subject_id FROM Subjects WHERE code = 'ASSC 1800')),
((SELECT subject_id FROM Subjects WHERE code = 'CSCI 2100'), (SELECT subject_id FROM Subjects WHERE code = 'ASSC 1801'));

-- CSCI 2110: CSCI 1110
INSERT INTO Prerequisites (course_id, required_course_id)
VALUES ((SELECT subject_id FROM Subjects WHERE code = 'CSCI 2110'), (SELECT subject_id FROM Subjects WHERE code = 'CSCI 1110'));

-- CSCI 2134: CSCI 1110
INSERT INTO Prerequisites (course_id, required_course_id)
VALUES ((SELECT subject_id FROM Subjects WHERE code = 'CSCI 2134'), (SELECT subject_id FROM Subjects WHERE code = 'CSCI 1110'));

-- CSCI 2141: CSCI 1110
INSERT INTO Prerequisites (course_id, required_course_id)
VALUES ((SELECT subject_id FROM Subjects WHERE code = 'CSCI 2141'), (SELECT subject_id FROM Subjects WHERE code = 'CSCI 1110'));

-- CSCI 2170: CSCI 1170
INSERT INTO Prerequisites (course_id, required_course_id)
VALUES ((SELECT subject_id FROM Subjects WHERE code = 'CSCI 2170'), (SELECT subject_id FROM Subjects WHERE code = 'CSCI 1170'));

-- CSCI 2691: CSCI 1110, CSCI 1170
INSERT INTO Prerequisites (course_id, required_course_id)
VALUES
((SELECT subject_id FROM Subjects WHERE code = 'CSCI 2691'), (SELECT subject_id FROM Subjects WHERE code = 'CSCI 1110')),
((SELECT subject_id FROM Subjects WHERE code = 'CSCI 2691'), (SELECT subject_id FROM Subjects WHERE code = 'CSCI 1170'));

-- MGMT 2303: MGMT 1302
INSERT INTO Prerequisites (course_id, required_course_id)
VALUES ((SELECT subject_id FROM Subjects WHERE code = 'MGMT 2303'), (SELECT subject_id FROM Subjects WHERE code = 'MGMT 1302'));

-- CSCI 3130: CSCI 2110, CSCI 2134
INSERT INTO Prerequisites (course_id, required_course_id)
VALUES
((SELECT subject_id FROM Subjects WHERE code = 'CSCI 3130'), (SELECT subject_id FROM Subjects WHERE code = 'CSCI 2110')),
((SELECT subject_id FROM Subjects WHERE code = 'CSCI 3130'), (SELECT subject_id FROM Subjects WHERE code = 'CSCI 2134'));

-- CSCI 3160: CSCI 2170
INSERT INTO Prerequisites (course_id, required_course_id)
VALUES ((SELECT subject_id FROM Subjects WHERE code = 'CSCI 3160'), (SELECT subject_id FROM Subjects WHERE code = 'CSCI 2170'));

-- CSCI 3171: CSCI 1120, CSCI 2134, CSCI 2110
INSERT INTO Prerequisites (course_id, required_course_id)
VALUES
((SELECT subject_id FROM Subjects WHERE code = 'CSCI 3171'), (SELECT subject_id FROM Subjects WHERE code = 'CSCI 1120')),
((SELECT subject_id FROM Subjects WHERE code = 'CSCI 3171'), (SELECT subject_id FROM Subjects WHERE code = 'CSCI 2134')),
((SELECT subject_id FROM Subjects WHERE code = 'CSCI 3171'), (SELECT subject_id FROM Subjects WHERE code = 'CSCI 2110'));

-- CSCI 3172: CSCI 2134, CSCI 2141, CSCI 2170
INSERT INTO Prerequisites (course_id, required_course_id)
VALUES
((SELECT subject_id FROM Subjects WHERE code = 'CSCI 3172'), (SELECT subject_id FROM Subjects WHERE code = 'CSCI 2134')),
((SELECT subject_id FROM Subjects WHERE code = 'CSCI 3172'), (SELECT subject_id FROM Subjects WHERE code = 'CSCI 2141')),
((SELECT subject_id FROM Subjects WHERE code = 'CSCI 3172'), (SELECT subject_id FROM Subjects WHERE code = 'CSCI 2170'));

-- CSCI 3691: CSCI 2134, CSCI 2170, CSCI 2690, CSCI 2691
INSERT INTO Prerequisites (course_id, required_course_id)
VALUES
((SELECT subject_id FROM Subjects WHERE code = 'CSCI 3691'), (SELECT subject_id FROM Subjects WHERE code = 'CSCI 2134')),
((SELECT subject_id FROM Subjects WHERE code = 'CSCI 3691'), (SELECT subject_id FROM Subjects WHERE code = 'CSCI 2170')),
((SELECT subject_id FROM Subjects WHERE code = 'CSCI 3691'), (SELECT subject_id FROM Subjects WHERE code = 'CSCI 2690')),
((SELECT subject_id FROM Subjects WHERE code = 'CSCI 3691'), (SELECT subject_id FROM Subjects WHERE code = 'CSCI 2691'));

-- CSCI 4163: CSCI 3160
INSERT INTO Prerequisites (course_id, required_course_id)
VALUES ((SELECT subject_id FROM Subjects WHERE code = 'CSCI 4163'), (SELECT subject_id FROM Subjects WHERE code = 'CSCI 3160'));

-- CSCI 414X: CSCI 2141, CSCI 3130, CSCI 2110
INSERT INTO Prerequisites (course_id, required_course_id)
VALUES
((SELECT subject_id FROM Subjects WHERE code = 'CSCI 414X'), (SELECT subject_id FROM Subjects WHERE code = 'CSCI 2141')),
((SELECT subject_id FROM Subjects WHERE code = 'CSCI 414X'), (SELECT subject_id FROM Subjects WHERE code = 'CSCI 3130')),
((SELECT subject_id FROM Subjects WHERE code = 'CSCI 414X'), (SELECT subject_id FROM Subjects WHERE code = 'CSCI 2110'));

-- CSCI 4691: CSCI 3130, CSCI 3691, MGMT 2303
INSERT INTO Prerequisites (course_id, required_course_id)
VALUES
((SELECT subject_id FROM Subjects WHERE code = 'CSCI 4691'), (SELECT subject_id FROM Subjects WHERE code = 'CSCI 3130')),
((SELECT subject_id FROM Subjects WHERE code = 'CSCI 4691'), (SELECT subject_id FROM Subjects WHERE code = 'CSCI 3691')),
((SELECT subject_id FROM Subjects WHERE code = 'CSCI 4691'), (SELECT subject_id FROM Subjects WHERE code = 'MGMT 2303'));

-- MGMT 2801: MGMT 1302
INSERT INTO Prerequisites (course_id, required_course_id)
VALUES ((SELECT subject_id FROM Subjects WHERE code = 'MGMT 2801'), (SELECT subject_id FROM Subjects WHERE code = 'MGMT 1302'));
