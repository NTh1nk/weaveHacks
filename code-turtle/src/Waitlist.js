import React, { useState } from 'react';
import './App.css';
import { supabase } from './supabaseClient';

function Waitlist() {
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({ email: '' });
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    setForm({ ...form, email: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    // Insert into Supabase
    const { error } = await supabase
      .from('waitlist')
      .insert([{ email: form.email }]);
    if (error) {
      setError('There was a problem joining the waitlist. Please try again.');
    } else {
      setSubmitted(true);
    }
  };

  if (submitted) {
    return (
      <div className="waitlist-container">
        <img
          src={process.env.PUBLIC_URL + '/turtle.png'}
          alt="CodeTurtle Logo"
          className="waitlist-logo"
          style={{ width: 80, height: 80, marginBottom: 18 }}
        />
        <h2>Thank you for joining the waitlist! <span role="img" aria-label="party">🎉</span></h2>
        <p>We'll let you know as soon as CodeTurtle is ready for you.<br/>Stay tuned for our GitHub bot launch!</p>
        <button
          className="main-cta return-btn"
          style={{ marginTop: 24 }}
          onClick={() => window.location.href = '/'}
        >
          Return to Landing Page
        </button>
      </div>
    );
  }

  return (
    <div className="waitlist-container">
      <img
        src={process.env.PUBLIC_URL + '/turtle.png'}
        alt="CodeTurtle Logo"
        className="waitlist-logo"
        style={{ width: 80, height: 80, marginBottom: 18 }}
      />
      <h2>Join the CodeTurtle Waitlist</h2>
      <div className="waitlist-subtitle">Coming soon as a <span className="github-bot">GitHub Bot</span> <span role="img" aria-label="robot">🤖</span></div>
      <form className="waitlist-form" onSubmit={handleSubmit}>
        <label>
          Email
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            required
          />
        </label>
        <button type="submit" className="main-cta">Join Waitlist</button>
        {error && <p style={{ color: 'red' }}>{error}</p>}
      </form>
      <button
        className="main-cta return-btn"
        style={{ marginTop: 18 }}
        onClick={() => window.location.href = '/'}
      >
        Return to Landing Page
      </button>
    </div>
  );
}

export default Waitlist; 