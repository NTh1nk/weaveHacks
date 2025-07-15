import React, { useState, useEffect } from 'react';
import './App.css';
import { useNavigate } from 'react-router-dom';
import { supabase } from './supabaseClient';

function App() {
  const [showBanner, setShowBanner] = useState(true);
  const [waitlistCount, setWaitlistCount] = useState(null);
  const [waitlistError, setWaitlistError] = useState(null);
  const [waitlistSubmitted, setWaitlistSubmitted] = useState(false);
  const [waitlistForm, setWaitlistForm] = useState({ email: '' });
  const [waitlistFormError, setWaitlistFormError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchWaitlistCount() {
      setWaitlistError(null);
      try {
        const { count, error } = await supabase
          .from('waitlist')
          .select('*', { count: 'exact', head: true });
        if (error) {
          setWaitlistError('Could not fetch waitlist count.');
        } else {
          setWaitlistCount(count);
        }
      } catch (err) {
        setWaitlistError('Could not fetch waitlist count.');
      }
    }
    fetchWaitlistCount();
  }, []);

  const handleWaitlistChange = (e) => {
    setWaitlistForm({ ...waitlistForm, email: e.target.value });
  };

  const handleWaitlistSubmit = async (e) => {
    e.preventDefault();
    setWaitlistFormError(null);
    // Insert into Supabase
    const { error } = await supabase
      .from('waitlist')
      .insert([{ email: waitlistForm.email }]);
    if (error) {
      setWaitlistFormError('There was a problem joining the waitlist. Please try again.');
    } else {
      setWaitlistSubmitted(true);
      setWaitlistForm({ email: '' });
      // Refresh the count
      const { count } = await supabase
        .from('waitlist')
        .select('*', { count: 'exact', head: true });
      if (count !== null) {
        setWaitlistCount(count);
      }
    }
  };

  return (
    <div className="landing-root">
      <header className="landing-header">
        <div className="logo-brand">
          <img src={process.env.PUBLIC_URL + '/turtle.png'} className="landing-logo" alt="Code Turtle Logo" />
          <span className="brand-name">CodeTurtle</span>
        </div>
        <nav className="landing-nav">
             {/*
          <a href="#powered-by">Powered by</a>
       
          <a href="#customers">Customers</a>
          <a href="#pricing">Pricing</a>
          <a href="#blog">Blog</a>
          <a href="#resources">Resources</a>
          */}
          <button className="media-btn" onClick={() => navigate('/media')}>Media</button>
        </nav>
      </header>
      <main className="landing-main">
        <h1>Slow and Steady Wins the Race!</h1>
        <h2>Let CodeTurtle help your team review code with the wisdom and steadiness of a turtle. Fewer bugs, more reliability, and a shell of protection for your codebase.</h2>
        
        {waitlistSubmitted ? (
          <div className="waitlist-success">
            <h3>Thank you for joining the waitlist! <span role="img" aria-label="party">🎉</span></h3>
            <p>We'll let you know as soon as CodeTurtle is ready for you.<br/>Stay tuned for our GitHub bot launch!</p>
            <button 
              className="main-cta" 
              onClick={() => setWaitlistSubmitted(false)}
              style={{ marginTop: 16 }}
            >
              Join Another Email 🐢
            </button>
          </div>
        ) : (
          <div className="waitlist-signup">
            <h3>Join the CodeTurtle Waitlist</h3>
            <p>Coming soon as a <span className="github-bot">GitHub Bot</span> <span role="img" aria-label="robot">🤖</span></p>
            <form onSubmit={handleWaitlistSubmit} className="waitlist-form-inline">
              <div className="form-group">
                <input
                  type="email"
                  name="email"
                  value={waitlistForm.email}
                  onChange={handleWaitlistChange}
                  placeholder="Enter your email address"
                  required
                  className="email-input"
                />
                <button type="submit" className="main-cta">Join Waitlist 🐢</button>
              </div>
              {waitlistFormError && <p className="error-message">{waitlistFormError}</p>}
            </form>
          </div>
        )}
        {/* Waitlist tracker below CTA */}
        <div
          style={{
            marginBottom: 40,
            marginTop: 18,
            display: 'flex',
            justifyContent: 'center',
          }}
        >
          <div
            style={{
              background: 'linear-gradient(90deg, #fffbe6 0%, #e0f7e9 100%)',
              border: '4px solid #388e3c',
              borderRadius: 32,
              boxShadow: '0 8px 32px rgba(56, 142, 60, 0.18)',
              padding: '32px 48px',
              minWidth: 340,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              fontSize: '2.2rem',
              fontWeight: 900,
              color: '#184d27',
              letterSpacing: 1.2,
              position: 'relative',
              zIndex: 2,
              textShadow: '0 2px 8px #a8e06344',
              animation: 'grand-waitlist-pop 1.2s cubic-bezier(.68,-0.55,.27,1.55) 1',
            }}
          >
            <span style={{ fontSize: '2.8rem', marginBottom: 8, display: 'block' }} role="img" aria-label="turtle">🐢</span>
            {waitlistError && (
              <span style={{ color: 'red', fontWeight: 700, fontSize: '1.5rem' }}>Waitlist unavailable</span>
            )}
            {!waitlistError && waitlistCount === null && (
              <span style={{ color: '#388e3c', fontWeight: 700, fontSize: '1.5rem' }}>Loading waitlist...</span>
            )}
            {!waitlistError && waitlistCount !== null && (
              <>
                <span style={{ fontSize: '2.6rem', color: '#184d27', fontWeight: 900, lineHeight: 1 }}>
                  {waitlistCount.toLocaleString()}
                </span>
                <span style={{ fontSize: '1.5rem', color: '#388e3c', fontWeight: 700, marginTop: 8, display: 'block' }}>
                  <span role="img" aria-label="confetti">🎉</span> people on the waitlist! <span role="img" aria-label="star">🌟</span>
                </span>
                <span style={{ fontSize: '1.1rem', color: '#246b3c', fontWeight: 500, marginTop: 8, display: 'block' }}>
                  Join the movement. Be part of something big!
                </span>
              </>
            )}
          </div>
        </div>
        <div className="video-section">
          <h3>See CodeTurtle in Action</h3>
          <div className="video-placeholder">
            {/* Replace the src below with your actual video link when ready */}
            <iframe
              width="560"
              height="315"
              src="https://www.youtube.com/embed/W0O4atwl7zI"
              title="Code Turtle Demo Video"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
          </div>
        </div>
        <section className="simulation-section">
          <h3>How CodeTurtle Tests Your Code Like a Real User</h3>
          <p>
            CodeTurtle goes beyond static analysis—it actually simulates your code, interacting with it just like a real user would. This means your code is tested in real-world scenarios, catching issues that traditional code review tools might miss. Experience a new level of confidence in your code quality!
          </p>
        </section>
      </main>
      <footer className="landing-footer">
        <p>Powered by <span role="img" aria-label="turtle">🐢</span> Code Turtle — Slow and Steady Wins the Race!</p>
      </footer>
      {showBanner && (
        <div className="bottom-banner">
          <span className="bottom-banner-text">Powered by</span>
          <div className="bottom-banner-logos">
            <a href="https://weave.ai/" className="sponsor-name" target="_blank" rel="noopener noreferrer">Weave AI</a>
            <a href="https://crewai.com/" className="sponsor-name" target="_blank" rel="noopener noreferrer">CrewAI</a>
            <a href="https://supabase.com/" className="sponsor-name" target="_blank" rel="noopener noreferrer">Supabase</a>
            <a href="https://browserbase.com/" className="sponsor-name" target="_blank" rel="noopener noreferrer">Browserbase</a>
            <a href="https://wandb.ai/inference" className="sponsor-name" target="_blank" rel="noopener noreferrer">Weights & Biases Inference</a>
          </div>
          <button className="close-banner" onClick={() => setShowBanner(false)} aria-label="Close banner">×</button>
        </div>
      )}
    </div>
  );
}

export default App;
