import React from 'react';
import './App.css';

function App() {
  return (
    <div className="landing-root">
      <header className="landing-header">
        <div className="logo-brand">
          <img src={process.env.PUBLIC_URL + '/turtle.png'} className="landing-logo" alt="Code Turtle Logo" />
          <span className="brand-name">CodeTurtle</span>
        </div>
        <nav className="landing-nav">
          <a href="#enterprise">Enterprise</a>
          <a href="#ide">IDE</a>
          <a href="#customers">Customers</a>
          <a href="#pricing">Pricing</a>
          <a href="#blog">Blog</a>
          <a href="#resources">Resources</a>
          <button className="login-btn">Log In</button>
          <button className="trial-btn">Get a free trial</button>
        </nav>
      </header>
      <main className="landing-main">
        <h1>Slow and Steady Wins the Race!</h1>
        <h2>Let CodeTurtle help your team review code with the wisdom and steadiness of a turtle. Fewer bugs, more reliability, and a shell of protection for your codebase.</h2>
        <button className="main-cta">Get a free trial</button>
        <p className="trial-info">14-day free trial · No credit card needed · 2-click signup with GitHub/GitLab.</p>
        <div className="video-section">
          <h3>See CodeTurtle in Action</h3>
          <div className="video-placeholder">
            {/* Replace the src below with your actual video link when ready */}
            <iframe
              width="560"
              height="315"
              src="https://www.youtube.com/embed/dQw4w9WgXcQ"
              title="CodeTurtle Demo Video"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
          </div>
        </div>
      </main>
      <footer className="landing-footer">
        <p>Powered by <span role="img" aria-label="turtle">🐢</span> CodeTurtle - Slow and Steady Wins the Race!</p>
      </footer>
    </div>
  );
}

export default App;
