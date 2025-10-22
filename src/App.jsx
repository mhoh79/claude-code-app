import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom'
import Home from './Home.jsx'
import Tetris from './Tetris.jsx'
import Calculator from './Calculator.jsx'
import './App.css'

function App() {
  return (
    <Router basename="/claude-code-app">
      <div className="App">
        <nav className="navbar">
          <div className="nav-container">
            <Link to="/" className="nav-logo">
              My GitHub Pages
            </Link>
            <ul className="nav-menu">
              <li className="nav-item">
                <Link to="/" className="nav-link">Home</Link>
              </li>
              <li className="nav-item">
                <Link to="/tetris" className="nav-link">Tetris</Link>
              </li>
              <li className="nav-item">
                <Link to="/calculator" className="nav-link">Calculator</Link>
              </li>
            </ul>
          </div>
        </nav>

        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/tetris" element={<Tetris />} />
          <Route path="/calculator" element={<Calculator />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App
