import React from 'react';
import './App.css';

function App() {
  return (
    <div className="landing-root">
      <header className="landing-header">
        <img src={process.env.PUBLIC_URL + '/turtle.png'} className="landing-logo" alt="Code Turtle Logo" />
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
        <h1>Cut Code Review Time & Bugs in Half. Instantly.</h1>
        <h2>Supercharge your team to ship faster with the most advanced AI code reviews. Now with turtle power!</h2>
        <button className="main-cta">Get a free trial</button>
        <p className="trial-info">14-day free trial · No credit card needed · 2-click signup with GitHub/GitLab.</p>
      </main>
      <footer className="landing-footer">
        <p>Powered by <span role="img" aria-label="turtle">🐢</span> Code Turtle</p>
      </footer>
    </div>
  );
}

export default App;
