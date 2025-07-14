import React, { useState } from 'react';
import './App.css';
import { supabase } from './supabaseClient';

function Waitlist() {
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({ name: '', email: '' });
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    // Insert into Supabase
    const { error } = await supabase
      .from('waitlist')
      .insert([{ name: form.name, email: form.email }]);
    if (error) {
      setError('There was a problem joining the waitlist. Please try again.');
    } else {
      setSubmitted(true);
    }
  };

  if (submitted) {
    return (
      <div className="waitlist-container">
        <h2>Thank you for joining the waitlist!</h2>
        <p>We'll let you know as soon as CodeTurtle is ready for you.</p>
      </div>
    );
  }

  return (
    <div className="waitlist-container">
      <h2>Join the CodeTurtle Waitlist</h2>
      <form className="waitlist-form" onSubmit={handleSubmit}>
        <label>
          Name
          <input
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            required
          />
        </label>
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
    </div>
  );
}

export default Waitlist; 