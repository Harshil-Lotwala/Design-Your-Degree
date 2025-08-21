import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import './Login.css';

function Login({ setUser }) {

  // State to track user input
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  const API_URL = "http://127.0.0.1:5000";

  // Email validation function
  const isEmailValid = (email) => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.(com|ca|edu|org|net|gov|mil|int|info)$/;
    return emailRegex.test(email);
  };

  // handle user login
  const handleLogin = async () => {
    if (!email || !password) {
      alert("Please enter both email and password.");
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

    // passowrd strength validation
    const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?#&_])[A-Za-z\d@$!%*?#&_]{8,}$/;
    if (!strongPasswordRegex.test(password)) {
        alert("Password must be at least 8 characters long and include a number, uppercase, lowercase, and special character.");
        return;  
    }

    try {
      // send login credentials to backend
      const response = await fetch(`${API_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });

      const contentType = response.headers.get("content-type");
      let data;

      // check if response is JSON
      if (contentType && contentType.includes("application/json")) {
        data = await response.json();
      } else {
        alert("Unexpected server response.");
        return;
      }

      if (response.ok) {
        //save user info to local Storage 
        localStorage.setItem("user", JSON.stringify(data.user));
        localStorage.setItem("user_id", data.user.id);
        setUser(data.user);
        navigate("/planner");
      } else {
        alert(data.message || "Login failed.");
      }

    } catch (error) {
      alert("Something went wrong.");
    }
  };

  return (
    <div className="loginPage">
      <h2>Login</h2>
      <input
        type="email"
        autoComplete="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
      />
      <input
        type="password"
        autoComplete="current-password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
      />
      <button className="logInButton" onClick={handleLogin}>Log in</button>
      <Link to="/forgotPassword">Forgot Password?</Link>
    </div>
  );
}

export default Login;
