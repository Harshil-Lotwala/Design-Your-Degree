import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import './Signup.css';

function Signup() {
  // state variables to track user input fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('Student');
  const [programId, setProgramId] = useState('1'); // default: BCS
  const [securityQuestion1, setSecurityQuestion1] = useState('');
  const [securityAnswer1, setSecurityAnswer1] = useState('');
  const [securityQuestion2, setSecurityQuestion2] = useState('');
  const [securityAnswer2, setSecurityAnswer2] = useState('');
  const navigate = useNavigate();

  const API_URL = "http://127.0.0.1:5000";

  // Email validation function
  const isEmailValid = (email) => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.(com|ca|edu|org|net|gov|mil|int|info)$/;
    return emailRegex.test(email);
  };

  // Apple-style password rule enforcement
  const isPasswordValid = (pwd) => {
    const lengthCheck = pwd.length >= 8;
    const uppercaseCheck = /[A-Z]/.test(pwd);
    const lowercaseCheck = /[a-z]/.test(pwd);
    const numberCheck = /[0-9]/.test(pwd);
    const specialCharCheck = /[!@#$%^&*]/.test(pwd);
    return lengthCheck && uppercaseCheck && lowercaseCheck && numberCheck && specialCharCheck;
  };

  // handles signup form submission
  const handleSignup = async () => {
    if (!name || !email || !password || !role || !programId || !securityQuestion1 || !securityAnswer1 || !securityQuestion2 || !securityAnswer2) {
      alert("Please fill in all fields.");
      return;
    }

    // check if email is valid
    if (!isEmailValid(email)) {
      alert(
        "Please enter a valid email address.\n" +
        "Valid formats: example@domain.com, example@domain.ca, etc.\n" +
        "Accepted domains: .com, .ca, .edu, .org, .net, .gov, .mil, .int, .info"
      );
      return;
    }

    // check if passowrd meets security criteria
    if (!isPasswordValid(password)) {
      alert(
        "Password must be at least 8 characters long and include:\n" +
        "- An uppercase letter\n" +
        "- A lowercase letter\n" +
        "- A number\n" +
        "- A special character (!@#$%^&*)"
      );
      return;
    }

    try {
      // make POST request to backend API to register the user
      const response = await fetch(`${API_URL}/signup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          name,
          email,
          password,
          role,
          program_id: parseInt(programId),
          security_question_1: securityQuestion1,
          security_answer_1: securityAnswer1,
          security_question_2: securityQuestion2,
          security_answer_2: securityAnswer2
        })
      });

      const data = await response.json();

      if (response.ok) {
        alert("Signup successful! Please log in.");
        navigate("/login");
      } else {
        alert(data.message || "Signup failed.");
      }
    } catch (error) {
      console.error("Signup error:", error);
      alert("Something went wrong.");
    }
  };

  return (
    <div className="signupPage">
      <h2>Create Account</h2>
      <input
        type="text"
        placeholder="Full Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <input
        type="email"
        placeholder="Email Address"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      
      <select value={role} onChange={(e) => setRole(e.target.value)}>
        <option value="Student">Student</option>
        <option value="Advisor">Advisor</option>
      </select>

      <select value={programId} onChange={(e) => setProgramId(e.target.value)}>
        <option value="1">Bachelor of Computer Science</option>
        <option value="2">Bachelor of Applied Computer Science</option>
      </select>

      {/* Security Questions Section */}
      <h3 style={{margin: '1.5rem 0 1rem 0', color: 'var(--dal-black)'}}>Security Questions</h3>
      <p style={{fontSize: '0.9rem', color: '#666', marginBottom: '1rem'}}>These will be used to reset your password if forgotten.</p>
      
      <select 
        value={securityQuestion1} 
        onChange={(e) => setSecurityQuestion1(e.target.value)}
        style={{marginBottom: '0.5rem'}}
      >
        <option value="">Select Security Question 1</option>
        <option value="What was the name of your first pet?">What was the name of your first pet?</option>
        <option value="In what city were you born?">In what city were you born?</option>
        <option value="What is your mother's maiden name?">What is your mother's maiden name?</option>
        <option value="What was the name of your first school?">What was the name of your first school?</option>
        <option value="What is your favorite movie?">What is your favorite movie?</option>
      </select>
      
      <input
        type="text"
        placeholder="Answer to Security Question 1"
        value={securityAnswer1}
        onChange={(e) => setSecurityAnswer1(e.target.value)}
      />
      
      <select 
        value={securityQuestion2} 
        onChange={(e) => setSecurityQuestion2(e.target.value)}
        style={{marginBottom: '0.5rem'}}
      >
        <option value="">Select Security Question 2</option>
        <option value="What was your childhood nickname?">What was your childhood nickname?</option>
        <option value="What is the name of your favorite teacher?">What is the name of your favorite teacher?</option>
        <option value="What street did you live on in third grade?">What street did you live on in third grade?</option>
        <option value="What is your favorite book?">What is your favorite book?</option>
        <option value="What was the make of your first car?">What was the make of your first car?</option>
      </select>
      
      <input
        type="text"
        placeholder="Answer to Security Question 2"
        value={securityAnswer2}
        onChange={(e) => setSecurityAnswer2(e.target.value)}
      />

      <button className="signUpButton" onClick={handleSignup}>
        Sign Up
      </button>

      <Link to="/login">Already have an account? Log in</Link>
    </div>
  );
}

export default Signup;
