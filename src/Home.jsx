import { useState } from 'react'
import { Link } from 'react-router-dom'
import './Home.css'

function Home() {
  const [count, setCount] = useState(0)

  return (
    <div className="home-container">
      <div className="home-content">
        <h1>Welcome to My GitHub Pages Site!</h1>
        <p>This is a modern React site built with Vite</p>

        <div className="card">
          <button onClick={() => setCount((count) => count + 1)}>
            Clicked {count} times
          </button>
          <p>Try clicking the button above!</p>
        </div>

        <div className="info-section">
          <h2>What is this?</h2>
          <ul>
            <li><strong>React</strong> - A JavaScript library for building user interfaces</li>
            <li><strong>Vite</strong> - A fast build tool that makes development smooth</li>
            <li><strong>GitHub Pages</strong> - Free hosting for your website</li>
          </ul>
        </div>

        <div className="games-section">
          <h2>Try the Games!</h2>
          <Link to="/tetris" className="game-link">
            <div className="game-card">
              <h3>Tetris</h3>
              <p>Classic falling blocks game</p>
              <span className="play-button">Play Now →</span>
            </div>
          </Link>
        </div>
      </div>
    </div>
  )
}

export default Home
