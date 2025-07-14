import React from 'react';
import './App.css';
import { useNavigate } from 'react-router-dom';

const posts = [
  {
    id: 1,
    image: 'https://challengepost-s3-challengepost.netdna-ssl.com/photos/production/software_photos/002/823/857/datas/gallery.jpg', // Example Devpost screenshot or use a placeholder
    title: '🐢 CodeTurtle: How We Stopped Kevin',
    description: `Our intern Kevin merged a pull request Friday at 4:59 PM. He used ChatGPT to vibecode his entire PR!\n\nIt passed CI. It passed unit tests. It also took down production in 12 seconds.\n\nThat\'s why we built CodeTurtle: a GitHub App powered by BrowserBase & CrewAI that tests and simulates your pull requests like real users before they hit main. Now, Kevin still vibe codes... but CodeTurtle vibe-tests first. Prod is safe. The vibes are strong. 🐢`,
    link: 'https://devpost.com/software/codeturtle?_gl=1*1ctht9u*_gcl_au*MTk4MDQyNzYwMC4xNzUyNDI3NzEw*_ga*NTE4NjQzNTQ1LjE3NTI0Mjc3MTg.*_ga_0YHJK3Y10M*czE3NTI1MjUyMjMkbzQkZzEkdDE3NTI1MjUyMzckajQ2JGwwJGgw',
    linkLabel: 'View on Devpost'
  }
  // Add more posts here as needed
];

function Media() {
  const navigate = useNavigate();
  return (
    <div className="media-page">
      <button className="main-cta" style={{ position: 'absolute', left: 32, top: 32, minWidth: 120 }} onClick={() => navigate('/')}>← Home</button>
      <h2 className="media-title">Media Gallery</h2>
      <div className="media-gallery">
        {posts.map(post => (
          <div className="media-post" key={post.id}>
            <img src={post.image} alt={post.title} className="media-image" />
            <h3 className="media-post-title">{post.title}</h3>
            <p className="media-post-desc" style={{ whiteSpace: 'pre-line' }}>{post.description}</p>
            {post.link && (
              <a href={post.link} className="main-cta" target="_blank" rel="noopener noreferrer" style={{marginTop: 16, display: 'inline-block'}}>
                {post.linkLabel || 'Learn More'}
              </a>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default Media; 