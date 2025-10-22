import { useState } from 'react'
import './App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <div className="App">
      <header className="App-header">
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
      </header>
    </div>
  )
}

export default App
