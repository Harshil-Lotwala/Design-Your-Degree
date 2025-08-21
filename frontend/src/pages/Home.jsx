import React from 'react';
import { Link } from 'react-router-dom';
import './Home.css';

function Home(){
  return(
    <div className = "landingPage">
      <h1>Design Your Degree</h1>
      <h2>Create your own academic plan</h2>
      <Link to="/login">
        <button className="loginButton">Login</button>
      </Link>
      <div className="buttonGroup">
        <button>BCS</button>
        <button>BACS</button>
      </div>
    </div>
  )
}

export default Home;
