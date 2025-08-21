import React, {useState} from "react";
import './ForgotPassword.css';
import { Link } from "react-router-dom";

function ForgotPassword(){
    // State for email and security questions
    const [email, setEmail] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [securityQuestion1, setSecurityQuestion1] = useState('');
    const [securityAnswer1, setSecurityAnswer1] = useState('');
    const [securityQuestion2, setSecurityQuestion2] = useState('');
    const [securityAnswer2, setSecurityAnswer2] = useState('');
    const [questionsLoaded, setQuestionsLoaded] = useState(false);

    const API_URL = "http://127.0.0.1:5000";

    // Email validation function
    const isEmailValid = (email) => {
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.(com|ca|edu|org|net|gov|mil|int|info)$/;
        return emailRegex.test(email);
    };

    // Password validation function
    const isPasswordValid = (pwd) => {
        const lengthCheck = pwd.length >= 8;
        const uppercaseCheck = /[A-Z]/.test(pwd);
        const lowercaseCheck = /[a-z]/.test(pwd);
        const numberCheck = /[0-9]/.test(pwd);
        const specialCharCheck = /[!@#$%^&*]/.test(pwd);
        return lengthCheck && uppercaseCheck && lowercaseCheck && numberCheck && specialCharCheck;
    };

    // Retrieve security questions after email submission
    const fetchSecurityQuestions = async (event) => {
        event.preventDefault();
        
        // Validate email format
        if (!isEmailValid(email)) {
            alert(
                "Please enter a valid email address.\n" +
                "Valid formats: example@domain.com, example@domain.ca, etc.\n" +
                "Accepted domains: .com, .ca, .edu, .org, .net, .gov, .mil, .int, .info"
            );
            return;
        }

        try {
            const response = await fetch(`${API_URL}/get-security-questions`, {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email })
            });

            const data = await response.json();

            if (response.ok) {
                setSecurityQuestion1(data.security_question_1);
                setSecurityQuestion2(data.security_question_2);
                setQuestionsLoaded(true);
            } else {
                alert(data.message || "Could not retrieve security questions.");
            }
        } catch (error) {
            console.error("Error fetching security questions:", error);
            alert("Something went wrong while retrieving security questions.");
        }
    }

    // Handle form submission for password reset
    const handleSubmit = async (event) => {
        event.preventDefault();

        // Validate all fields are filled
        if (!email || !newPassword || !confirmPassword || !securityAnswer1 || !securityAnswer2) {
            alert("Please fill in all fields.");
            return;
        }

        // Validate new password meets criteria
        if (!isPasswordValid(newPassword)) {
            alert(
                "New password must be at least 8 characters long and include:\n" +
                "- An uppercase letter\n" +
                "- A lowercase letter\n" +
                "- A number\n" +
                "- A special character (!@#$%^&*)"
            );
            return;
        }

        // Check if new passwords match
        if (newPassword !== confirmPassword) {
            alert("New passwords do not match.");
            return;
        }

        // Attempt to reset password
        try {
            const response = await fetch(`${API_URL}/reset-password`, {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    email,
                    security_answer_1: securityAnswer1,
                    security_answer_2: securityAnswer2,
                    new_password: newPassword
                })
            });

            const data = await response.json();

            if (response.ok) {
                alert("Password reset successfully! You can now login with your new password.");
                // Clear all fields
                setEmail('');
                setNewPassword('');
                setConfirmPassword('');
                setSecurityAnswer1('');
                setSecurityAnswer2('');
                setQuestionsLoaded(false);
            } else {
                alert(data.message || "Password reset failed.");
            }
        } catch (error) {
            console.error("Password reset error:", error);
            alert("Something went wrong while resetting password.");
        }
    }

    return(
        <div className="forgotPassword">
            <h2>Reset Password</h2>
            {!questionsLoaded ? (
                <form onSubmit={fetchSecurityQuestions}>
                    <input 
                        type="email" 
                        value={email} 
                        onChange={(event) => setEmail(event.target.value)} 
                        placeholder="Enter your email address" 
                        required 
                    />
                    <button type="submit">Get Security Questions</button>
                    <Link to="/login" className="backLink">Back to Login</Link>
                </form>
            ) : (
                <form onSubmit={handleSubmit}>
                    <p><strong>Email:</strong> {email}</p>
                    <label>{securityQuestion1}</label>
                    <input 
                        type="text" 
                        value={securityAnswer1} 
                        onChange={(event) => setSecurityAnswer1(event.target.value)} 
                        placeholder="Answer to first question" 
                        required 
                    />
                    <label>{securityQuestion2}</label>
                    <input 
                        type="text" 
                        value={securityAnswer2} 
                        onChange={(event) => setSecurityAnswer2(event.target.value)} 
                        placeholder="Answer to second question" 
                        required 
                    />
                    <input 
                        type="password" 
                        value={newPassword} 
                        onChange={(event) => setNewPassword(event.target.value)} 
                        placeholder="New Password" 
                        required 
                    />
                    <input 
                        type="password" 
                        value={confirmPassword} 
                        onChange={(event) => setConfirmPassword(event.target.value)} 
                        placeholder="Confirm New Password" 
                        required 
                    />
                    <button type="submit">Reset Password</button>
                    <Link to="/login" className="backLink">Back to Login</Link>
                </form>
            )}
        </div>
    )
}

export default ForgotPassword;
