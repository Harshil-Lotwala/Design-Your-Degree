from flask import Flask, request, jsonify
import mysql.connector
from db_config import db_config
from flask_cors import CORS
import bcrypt

app = Flask(__name__)
CORS(app, origins=["http://localhost:3000"], supports_credentials=True)


# Home route
@app.route('/')
def home():
    try:
        conn = mysql.connector.connect(**db_config)
        cursor = conn.cursor()
        cursor.execute("SHOW TABLES;")
        tables = cursor.fetchall()
        cursor.close()
        conn.close()
        return f"Tables in DB: {tables}"
    except mysql.connector.Error as err:
        return f"MySQL connection failed: {err}", 500

# Signup route
@app.route('/signup', methods=['POST'])
def signup():
    data = request.get_json()
    try:
        # Hash the password before storing
        password_bytes = data['password'].encode('utf-8')
        salt = bcrypt.gensalt()
        hashed_password = bcrypt.hashpw(password_bytes, salt)
        
        conn = mysql.connector.connect(**db_config)
        cursor = conn.cursor()
        cursor.execute(
            "INSERT INTO Users (name, email, password_hash, role, program_id, security_question_1, security_answer_1, security_question_2, security_answer_2) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)",
            (data['name'], data['email'], hashed_password.decode('utf-8'), data['role'], data['program_id'], 
             data.get('security_question_1'), data.get('security_answer_1'), 
             data.get('security_question_2'), data.get('security_answer_2'))
        )
        conn.commit()
        cursor.close()
        conn.close()
        return jsonify({"message": "User registered successfully."}), 200
    except mysql.connector.Error as err:
        return jsonify({"message": f"Signup failed: {str(err)}"}), 400

# Login route
@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    try:
        conn = mysql.connector.connect(**db_config)
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT * FROM Users WHERE email = %s", (data['email'],))
        user = cursor.fetchone()
        cursor.close()
        conn.close()

        if user:
            # Verify the password against the stored hash
            stored_password = user["password_hash"].encode('utf-8')
            input_password = data['password'].encode('utf-8')
            
            if bcrypt.checkpw(input_password, stored_password):
                return jsonify({
                    "message": "Login successful.",
                    "user": {
                        "id": user["user_id"],
                        "name": user["name"],
                        "email": user["email"],
                        "role": user["role"],
                        "program_id": user["program_id"]
                    }
                }), 200
            else:
                return jsonify({"message": "Invalid email or password."}), 401
        else:
            return jsonify({"message": "Invalid email or password."}), 401
    except mysql.connector.Error:
        return jsonify({"message": "Login failed."}), 500

# Get terms
@app.route('/terms', methods=['GET'])
def get_terms():
    try:
        conn = mysql.connector.connect(**db_config)
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT term_id, term_name FROM Terms")
        terms = cursor.fetchall()
        cursor.close()
        conn.close()
        return jsonify(terms), 200
    except mysql.connector.Error as err:
        print("Error fetching terms:", err)
        return jsonify({"message": str(err)}), 500

# Get subjects
@app.route('/subjects', methods=['GET'])
def get_subjects():
    try:
        conn = mysql.connector.connect(**db_config)
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT subject_id, name, code, type FROM Subjects")
        subjects = cursor.fetchall()
        cursor.close()
        conn.close()
        return jsonify(subjects), 200
    except mysql.connector.Error as err:
        print("Error fetching subjects:", err)
        return jsonify({"message": "Internal server error"}), 500


# Add course (if logged in)
@app.route('/api/add-course', methods=['POST'])
def add_course_if_logged_in():
    data = request.get_json()
    if not data.get('user_id'):
        return jsonify({"message": "User not logged in — course not saved."}), 200

    try:
        conn = mysql.connector.connect(**db_config)
        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO StudentCourseSelections (user_id, subject_id, term_id, is_approved)
            VALUES (%s, %s, %s, FALSE)
        """, (data['user_id'], data['subject_id'], data['term_id']))
        conn.commit()
        cursor.close()
        conn.close()
        return jsonify({"message": "Course saved to DB."}), 201
    except mysql.connector.Error as err:
        print("Add-course failed:", err)
        return jsonify({"message": "Database insert failed."}), 500

# Get security questions for password reset
@app.route('/get-security-questions', methods=['POST'])
def get_security_questions():
    data = request.get_json()
    try:
        conn = mysql.connector.connect(**db_config)
        cursor = conn.cursor()
        cursor.execute("SELECT security_question_1, security_question_2 FROM Users WHERE email = %s", (data['email'],))
        questions = cursor.fetchone()
        cursor.close()
        conn.close()
        
        if questions and questions[0] and questions[1]:
            return jsonify({
                "security_question_1": questions[0],
                "security_question_2": questions[1]
            }), 200
        else:
            return jsonify({"message": "Email not found or security questions not set."}), 404
    except mysql.connector.Error as err:
        return jsonify({"message": f"Error fetching security questions: {str(err)}"}), 500

# Password reset with security questions
@app.route('/reset-password', methods=['POST'])
def reset_password():
    data = request.get_json()
    try:
        conn = mysql.connector.connect(**db_config)
        cursor = conn.cursor()
        cursor.execute("SELECT security_answer_1, security_answer_2 FROM Users WHERE email = %s", (data['email'],))
        user_answers = cursor.fetchone()

        if user_answers and user_answers[0].lower() == data['security_answer_1'].lower() and user_answers[1].lower() == data['security_answer_2'].lower():
            # Hash the new password before storing
            password_bytes = data['new_password'].encode('utf-8')
            salt = bcrypt.gensalt()
            hashed_password = bcrypt.hashpw(password_bytes, salt)
            
            cursor.execute("UPDATE Users SET password_hash = %s WHERE email = %s", (hashed_password.decode('utf-8'), data['email']))
            conn.commit()
            cursor.close()
            conn.close()
            return jsonify({"message": "Password updated successfully."}), 200
        else:
            cursor.close()
            conn.close()
            return jsonify({"message": "Invalid email or security answers."}), 401
    except mysql.connector.Error as err:
        return jsonify({"message": f"Password reset failed: {str(err)}"}), 500

# Update course status
@app.route('/api/update-course-status', methods=['POST'])
def update_course_status():
    data = request.get_json()
    try:
        conn = mysql.connector.connect(**db_config)
        cursor = conn.cursor()
        
        # Update the course status for the specific user and course
        cursor.execute("""
            UPDATE StudentCourseSelections 
            SET status = %s 
            WHERE user_id = %s AND subject_id = %s
        """, (data['status'], data['user_id'], data['subject_id']))
        
        if cursor.rowcount == 0:
            cursor.close()
            conn.close()
            return jsonify({"message": "Course not found or not enrolled."}), 404
            
        conn.commit()
        cursor.close()
        conn.close()
        return jsonify({"message": "Course status updated successfully."}), 200
    except mysql.connector.Error as err:
        print("Update course status failed:", err)
        return jsonify({"message": f"Status update failed: {str(err)}"}), 500

# Get user's course selections with status
@app.route('/api/user-courses/<int:user_id>', methods=['GET'])
def get_user_courses(user_id):
    try:
        conn = mysql.connector.connect(**db_config)
        cursor = conn.cursor(dictionary=True)
        cursor.execute("""
            SELECT scs.subject_id, s.code, s.name, s.type, scs.term_id, t.term_name, scs.status, scs.is_approved
            FROM StudentCourseSelections scs
            JOIN Subjects s ON scs.subject_id = s.subject_id
            JOIN Terms t ON scs.term_id = t.term_id
            WHERE scs.user_id = %s
        """, (user_id,))
        courses = cursor.fetchall()
        cursor.close()
        conn.close()
        return jsonify(courses), 200
    except mysql.connector.Error as err:
        print("Error fetching user courses:", err)
        return jsonify({"message": "Internal server error"}), 500

# Check prerequisites for a course with semester validation
@app.route('/api/check-prerequisites', methods=['POST'])
def check_prerequisites():
    data = request.get_json()
    try:
        conn = mysql.connector.connect(**db_config)
        cursor = conn.cursor(dictionary=True)
        
        # Get prerequisites for the course
        cursor.execute("""
            SELECT p.required_course_id, s.code as prereq_code, s.name as prereq_name
            FROM Prerequisites p
            JOIN Subjects s ON p.required_course_id = s.subject_id
            WHERE p.course_id = %s
        """, (data['subject_id'],))
        prerequisites = cursor.fetchall()
        
        if not prerequisites:
            cursor.close()
            conn.close()
            return jsonify({"valid": True, "message": "No prerequisites required."}), 200
        
        # Get user's current course selections with terms and statuses
        cursor.execute("""
            SELECT scs.subject_id, s.code, scs.term_id, t.term_name, scs.status
            FROM StudentCourseSelections scs
            JOIN Subjects s ON scs.subject_id = s.subject_id
            JOIN Terms t ON scs.term_id = t.term_id
            WHERE scs.user_id = %s
        """, (data['user_id'],))
        user_courses = cursor.fetchall()
        
        # Create mapping of course_id to course info
        course_map = {course['subject_id']: course for course in user_courses}
        
        # Helper function to compare term order
        def get_term_order(term_name):
            # Extract year and season from term name (e.g., "Fall 2023")
            parts = term_name.split()
            season = parts[0]
            year = int(parts[1])
            
            season_order = {"Fall": 0, "Winter": 1, "Summer": 2}
            return year * 10 + season_order.get(season, 0)
        
        target_term_order = get_term_order(data['target_term'])
        
        missing_prereqs = []
        invalid_scheduling = []
        
        for prereq in prerequisites:
            prereq_id = prereq['required_course_id']
            prereq_code = prereq['prereq_code']
            prereq_name = prereq['prereq_name']
            
            if prereq_id not in course_map:
                # Prerequisite not scheduled at all
                missing_prereqs.append({
                    "code": prereq_code,
                    "name": prereq_name,
                    "issue": "not_scheduled"
                })
            else:
                prereq_course = course_map[prereq_id]
                prereq_term_order = get_term_order(prereq_course['term_name'])
                
                # Check if prerequisite is completed
                if prereq_course['status'] == 'Completed':
                    continue  # This prerequisite is satisfied
                
                # If not completed, check if it's scheduled before the target course
                if prereq_term_order >= target_term_order:
                    invalid_scheduling.append({
                        "code": prereq_code,
                        "name": prereq_name,
                        "current_term": prereq_course['term_name'],
                        "status": prereq_course['status'],
                        "issue": "scheduled_too_late"
                    })
        
        cursor.close()
        conn.close()
        
        if missing_prereqs or invalid_scheduling:
            return jsonify({
                "valid": False,
                "missing_prerequisites": missing_prereqs,
                "invalid_scheduling": invalid_scheduling,
                "message": "Prerequisites not satisfied."
            }), 400
        
        return jsonify({"valid": True, "message": "All prerequisites satisfied."}), 200
        
    except mysql.connector.Error as err:
        print("Prerequisite check failed:", err)
        return jsonify({"message": f"Prerequisite check failed: {str(err)}"}), 500


# Register course with prerequisite check
@app.route('/register', methods=['POST'])
def register_course():
    data = request.get_json()
    try:
        conn = mysql.connector.connect(**db_config)
        cursor = conn.cursor()

        cursor.execute("SELECT required_course_id FROM Prerequisites WHERE course_id = %s", (data['subject_id'],))
        prerequisites = [row[0] for row in cursor.fetchall()]

        if prerequisites:
            cursor.execute("""
                SELECT subject_id FROM StudentCourseSelections
                WHERE user_id = %s AND is_approved = TRUE
            """, (data['user_id'],))
            completed_courses = [row[0] for row in cursor.fetchall()]
            missing = [req for req in prerequisites if req not in completed_courses]

            if missing:
                cursor.close()
                conn.close()
                return jsonify({
                    "message": "Missing prerequisites.",
                    "missing_course_ids": missing
                }), 400

        cursor.execute("""
            INSERT INTO StudentCourseSelections (user_id, subject_id, term_id, is_approved)
            VALUES (%s, %s, %s, FALSE)
        """, (data['user_id'], data['subject_id'], data['term_id']))
        conn.commit()
        cursor.close()
        conn.close()
        return jsonify({"message": "Registered successfully."}), 200
    except mysql.connector.Error as err:
        print("Register failed:", err)
        return jsonify({"message": f"Registration failed: {str(err)}"}), 500

if __name__ == '__main__':
    app.config['PROPAGATE_EXCEPTIONS'] = True
    app.run(debug=True)
