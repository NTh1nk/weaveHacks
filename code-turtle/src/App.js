import React, { useState } from 'react';
import './App.css';

function App() {
  const [showBanner, setShowBanner] = useState(true);
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
          <button className="login-btn">Log In</button>
          <button className="trial-btn">Demo</button>
        </nav>
      </header>
      <main className="landing-main">
        <h1>Slow and Steady Wins the Race!</h1>
        <h2>Let CodeTurtle help your team review code with the wisdom and steadiness of a turtle. Fewer bugs, more reliability, and a shell of protection for your codebase.</h2>
        <button className="main-cta" onClick={() => window.location.href = '/waitlist'}>Join the waitlist 🐢</button>
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
            <a href="https://fly.io/" className="sponsor-name" target="_blank" rel="noopener noreferrer">Fly.io</a>
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
