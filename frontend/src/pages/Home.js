import React, { useEffect, useState } from 'react';

function Home() {
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetch('http://localhost:5000/api/test')
      .then((res) => res.json())
      .then((data) => setMessage(data.message))
      .catch((err) => console.error("Flask API error:", err));
  }, []);

  return (
    <div>
      <h1>Welcome to Design Your Degree</h1>
      <p>Message from Flask: {message}</p>
    </div>
  );
}

export default Home;
