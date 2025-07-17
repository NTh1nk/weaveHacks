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
          <button className="media-btn" onClick={() => navigate('/media')}>Media</button>
        </nav>
      </header>
      <main className="landing-main">
        <section className="hero-section">
          <div className="hero-content">
            <div className="hero-eyebrow">🐢 turtle.codes</div>
            <h1 className="hero-title">
              <span className="hero-title-main">Vibe-test your code</span>
              <br />
              <span className="hero-title-accent">before it breaks production</span>
            </h1>
            <p className="hero-desc">
              VibeTester is the next-gen code review assistant.<br />
              Automatically simulate real user flows, catch bugs before they ship, and keep your codebase production-ready.<br />
              Powered by BrowserBase, CrewAI, Supabase, and more.
            </p>
            <div className="hero-cta-row">
              <button className="main-cta" onClick={() => document.getElementById('waitlist-section').scrollIntoView({behavior: 'smooth'})}>Start VibeTesting</button>
              <button className="secondary-cta" onClick={() => document.getElementById('video-section').scrollIntoView({behavior: 'smooth'})}>See a demo</button>
            </div>
          </div>
        </section>
        {/* <section className="trusted-by-row">
          <span className="trusted-by-label">Trusted by</span>
          <div className="trusted-logos">
            <a href="https://weave.ai/" target="_blank" rel="noopener noreferrer"><img src="/turtle.png" alt="Weave AI" className="trusted-logo" /></a>
            <a href="https://crewai.com/" target="_blank" rel="noopener noreferrer"><img src="/turtle.png" alt="CrewAI" className="trusted-logo" /></a>
            <a href="https://supabase.com/" target="_blank" rel="noopener noreferrer"><img src="/turtle.png" alt="Supabase" className="trusted-logo" /></a>
            <a href="https://browserbase.com/" target="_blank" rel="noopener noreferrer"><img src="/turtle.png" alt="Browserbase" className="trusted-logo" /></a>
          </div>
        </section> */}
        <section className="features-section">
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">🐢</div>
              <div className="feature-title">Real User Simulation</div>
              <div className="feature-desc">Test your code as if a real user is interacting with it, not just static analysis.</div>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🤖</div>
              <div className="feature-title">AI Powered</div>
              <div className="feature-desc">Harnesses advanced AI to review, test, and simulate your code for smarter, faster, and more reliable results.</div>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🤖</div>
              <div className="feature-title">GitHub Bot</div>
              <div className="feature-desc">Seamlessly integrates as a GitHub App for your workflow.</div>
            </div>
            <div className="feature-card">
              <div className="feature-icon">⚡</div>
              <div className="feature-title">Instant Feedback</div>
              <div className="feature-desc">Get actionable feedback in minutes, not hours or days.</div>
            </div>
          </div>
        </section>
        <section id="waitlist-section" className="waitlist-section">
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
          <div className="waitlist-tracker-card">
            <span className="waitlist-turtle" role="img" aria-label="turtle">🐢</span>
            {waitlistError && (
              <span className="waitlist-error">Waitlist unavailable</span>
            )}
            {!waitlistError && waitlistCount === null && (
              <span className="waitlist-loading">Loading waitlist...</span>
            )}
            {!waitlistError && waitlistCount !== null && (
              <>
                <span className="waitlist-count">{waitlistCount.toLocaleString()}</span>
                <span className="waitlist-people"><span role="img" aria-label="confetti">🎉</span> people on the waitlist! <span role="img" aria-label="star">🌟</span></span>
                <span className="waitlist-join">Join the movement. Be part of something big!</span>
              </>
            )}
          </div>
        </section>
        <div id="video-section" className="video-section">
          <h3>See CodeTurtle in Action</h3>
          <div className="video-placeholder">
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
        <p>Powered by</p>
        <div className="footer-logos">
          <a href="https://weave.ai/" className="footer-sponsor" target="_blank" rel="noopener noreferrer">
            <img src="/wandb-dots-logo.svg" alt="Weave AI" className="footer-logo-img" /> Weave AI
          </a>
          <a href="https://crewai.com/" className="footer-sponsor" target="_blank" rel="noopener noreferrer">
            <img src="/turtle.png" alt="CrewAI" className="footer-logo-img" /> CrewAI
          </a>
          <a href="https://supabase.com/" className="footer-sponsor" target="_blank" rel="noopener noreferrer">
            <img src="/supabase-logo-preview.webp" alt="Supabase" className="footer-logo-img" /> Supabase
          </a>
          <a href="https://browserbase.com/" className="footer-sponsor" target="_blank" rel="noopener noreferrer">
            <img src="/Browserbase.png" alt="Browserbase" className="footer-logo-img" /> Browserbase
          </a>
          <a href="https://wandb.ai/inference" className="footer-sponsor" target="_blank" rel="noopener noreferrer">
            <img src="/wandb-dots-logo.svg" alt="Weights & Biases Inference" className="footer-logo-img" /> Weights & Biases Inference
          </a>
        </div>
        <p>Slow and Steady Wins the Race! <span role="img" aria-label="turtle">🐢</span> Code Turtle</p>
      </footer>
      {/*
      <div className="bottom-banner">
        <span className="bottom-banner-text">Powered by</span>
        <div className="bottom-banner-logos">
          <a href="https://weave.ai/" className="sponsor-name" target="_blank" rel="noopener noreferrer">
            <img src="/turtle.png" alt="Weave AI" className="footer-logo-img" /> Weave AI
          </a>
          <a href="https://crewai.com/" className="sponsor-name" target="_blank" rel="noopener noreferrer">
            <img src="/turtle.png" alt="CrewAI" className="footer-logo-img" /> CrewAI
          </a>
          <a href="https://supabase.com/" className="sponsor-name" target="_blank" rel="noopener noreferrer">
            <img src="/turtle.png" alt="Supabase" className="footer-logo-img" /> Supabase
          </a>
          <a href="https://browserbase.com/" className="sponsor-name" target="_blank" rel="noopener noreferrer">
            <img src="/turtle.png" alt="Browserbase" className="footer-logo-img" /> Browserbase
          </a>
          <a href="https://wandb.ai/inference" className="sponsor-name" target="_blank" rel="noopener noreferrer">
            <img src="/turtle.png" alt="Weights & Biases Inference" className="footer-logo-img" /> Weights & Biases Inference
          </a>
        </div>
        <button className="close-banner" onClick={() => setShowBanner(false)} aria-label="Close banner">×</button>
      </div>
      */}
    </div>
  );
}

export default App;
