import { useState, useEffect, useCallback, useRef } from 'react'
import './Tetris.css'

// Tetris pieces
const PIECES = {
  I: [[1, 1, 1, 1]],
  O: [[1, 1], [1, 1]],
  T: [[0, 1, 0], [1, 1, 1]],
  S: [[0, 1, 1], [1, 1, 0]],
  Z: [[1, 1, 0], [0, 1, 1]],
  J: [[1, 0, 0], [1, 1, 1]],
  L: [[0, 0, 1], [1, 1, 1]]
}

const COLORS = {
  I: '#00f0f0',
  O: '#f0f000',
  T: '#a000f0',
  S: '#00f000',
  Z: '#f00000',
  J: '#0000f0',
  L: '#f0a000'
}

const BOARD_WIDTH = 10
const BOARD_HEIGHT = 20

function Tetris() {
  const [board, setBoard] = useState(createEmptyBoard())
  const [currentPiece, setCurrentPiece] = useState(null)
  const [currentPos, setCurrentPos] = useState({ x: 0, y: 0 })
  const [currentType, setCurrentType] = useState(null)
  const [score, setScore] = useState(0)
  const [gameOver, setGameOver] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [level, setLevel] = useState(1)
  const gameLoopRef = useRef(null)

  function createEmptyBoard() {
    return Array(BOARD_HEIGHT).fill(null).map(() => Array(BOARD_WIDTH).fill(0))
  }

  function getRandomPiece() {
    const pieces = Object.keys(PIECES)
    const randomType = pieces[Math.floor(Math.random() * pieces.length)]
    return { type: randomType, shape: PIECES[randomType] }
  }

  function canMove(piece, pos, board) {
    for (let y = 0; y < piece.length; y++) {
      for (let x = 0; x < piece[y].length; x++) {
        if (piece[y][x]) {
          const newX = pos.x + x
          const newY = pos.y + y

          if (newX < 0 || newX >= BOARD_WIDTH || newY >= BOARD_HEIGHT) {
            return false
          }

          if (newY >= 0 && board[newY][newX]) {
            return false
          }
        }
      }
    }
    return true
  }

  function mergePiece(piece, pos, type, board) {
    const newBoard = board.map(row => [...row])
    for (let y = 0; y < piece.length; y++) {
      for (let x = 0; x < piece[y].length; x++) {
        if (piece[y][x]) {
          const newY = pos.y + y
          if (newY >= 0) {
            newBoard[newY][pos.x + x] = type
          }
        }
      }
    }
    return newBoard
  }

  function clearLines(board) {
    let linesCleared = 0
    const newBoard = board.filter(row => {
      if (row.every(cell => cell !== 0)) {
        linesCleared++
        return false
      }
      return true
    })

    while (newBoard.length < BOARD_HEIGHT) {
      newBoard.unshift(Array(BOARD_WIDTH).fill(0))
    }

    return { board: newBoard, linesCleared }
  }

  function rotatePiece(piece) {
    const rows = piece.length
    const cols = piece[0].length
    const rotated = Array(cols).fill(null).map(() => Array(rows).fill(0))

    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        rotated[x][rows - 1 - y] = piece[y][x]
      }
    }

    return rotated
  }

  const spawnPiece = useCallback(() => {
    const { type, shape } = getRandomPiece()
    const startX = Math.floor((BOARD_WIDTH - shape[0].length) / 2)
    const startY = 0

    if (!canMove(shape, { x: startX, y: startY }, board)) {
      setGameOver(true)
      return
    }

    setCurrentPiece(shape)
    setCurrentType(type)
    setCurrentPos({ x: startX, y: startY })
  }, [board])

  const moveDown = useCallback(() => {
    if (!currentPiece || isPaused || gameOver) return

    const newPos = { x: currentPos.x, y: currentPos.y + 1 }

    if (canMove(currentPiece, newPos, board)) {
      setCurrentPos(newPos)
    } else {
      const mergedBoard = mergePiece(currentPiece, currentPos, currentType, board)
      const { board: clearedBoard, linesCleared } = clearLines(mergedBoard)

      setBoard(clearedBoard)
      setScore(prev => prev + linesCleared * 100 * level)

      if (linesCleared > 0 && score > 0 && score % 500 === 0) {
        setLevel(prev => prev + 1)
      }

      spawnPiece()
    }
  }, [currentPiece, currentPos, currentType, board, isPaused, gameOver, spawnPiece, level, score])

  const moveLeft = useCallback(() => {
    if (!currentPiece || isPaused || gameOver) return
    const newPos = { x: currentPos.x - 1, y: currentPos.y }
    if (canMove(currentPiece, newPos, board)) {
      setCurrentPos(newPos)
    }
  }, [currentPiece, currentPos, board, isPaused, gameOver])

  const moveRight = useCallback(() => {
    if (!currentPiece || isPaused || gameOver) return
    const newPos = { x: currentPos.x + 1, y: currentPos.y }
    if (canMove(currentPiece, newPos, board)) {
      setCurrentPos(newPos)
    }
  }, [currentPiece, currentPos, board, isPaused, gameOver])

  const rotate = useCallback(() => {
    if (!currentPiece || isPaused || gameOver) return
    const rotated = rotatePiece(currentPiece)
    if (canMove(rotated, currentPos, board)) {
      setCurrentPiece(rotated)
    }
  }, [currentPiece, currentPos, board, isPaused, gameOver])

  const drop = useCallback(() => {
    if (!currentPiece || isPaused || gameOver) return
    let newY = currentPos.y
    while (canMove(currentPiece, { x: currentPos.x, y: newY + 1 }, board)) {
      newY++
    }
    setCurrentPos({ x: currentPos.x, y: newY })
    setTimeout(moveDown, 50)
  }, [currentPiece, currentPos, board, isPaused, gameOver, moveDown])

  useEffect(() => {
    const handleKeyPress = (e) => {
      if (gameOver) return

      switch (e.key) {
        case 'ArrowLeft':
          e.preventDefault()
          moveLeft()
          break
        case 'ArrowRight':
          e.preventDefault()
          moveRight()
          break
        case 'ArrowDown':
          e.preventDefault()
          moveDown()
          break
        case 'ArrowUp':
          e.preventDefault()
          rotate()
          break
        case ' ':
          e.preventDefault()
          drop()
          break
        case 'p':
        case 'P':
          setIsPaused(prev => !prev)
          break
        default:
          break
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [moveLeft, moveRight, moveDown, rotate, drop, gameOver])

  useEffect(() => {
    if (!currentPiece) {
      spawnPiece()
    }
  }, [currentPiece, spawnPiece])

  useEffect(() => {
    if (gameOver || isPaused) {
      if (gameLoopRef.current) {
        clearInterval(gameLoopRef.current)
      }
      return
    }

    const speed = Math.max(100, 1000 - (level - 1) * 100)
    gameLoopRef.current = setInterval(moveDown, speed)

    return () => {
      if (gameLoopRef.current) {
        clearInterval(gameLoopRef.current)
      }
    }
  }, [moveDown, level, gameOver, isPaused])

  function resetGame() {
    setBoard(createEmptyBoard())
    setCurrentPiece(null)
    setScore(0)
    setLevel(1)
    setGameOver(false)
    setIsPaused(false)
  }

  function renderBoard() {
    const displayBoard = board.map(row => [...row])

    if (currentPiece && currentPos) {
      for (let y = 0; y < currentPiece.length; y++) {
        for (let x = 0; x < currentPiece[y].length; x++) {
          if (currentPiece[y][x]) {
            const newY = currentPos.y + y
            if (newY >= 0 && newY < BOARD_HEIGHT) {
              displayBoard[newY][currentPos.x + x] = currentType
            }
          }
        }
      }
    }

    return displayBoard.map((row, y) => (
      <div key={y} className="tetris-row">
        {row.map((cell, x) => (
          <div
            key={x}
            className="tetris-cell"
            style={{
              backgroundColor: cell ? COLORS[cell] : '#1a1a2e',
              border: cell ? '1px solid #000' : '1px solid #16213e'
            }}
          />
        ))}
      </div>
    ))
  }

  return (
    <div className="tetris-container">
      <div className="tetris-header">
        <h1>Tetris</h1>
        <div className="header-stats">
          <div className="stat-item">
            <span className="stat-label">Score</span>
            <span className="stat-value">{score}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Level</span>
            <span className="stat-value">{level}</span>
          </div>
        </div>
      </div>

      <div className="tetris-game">
        <div className="tetris-board-container">
          {gameOver && (
            <div className="game-over-overlay">
              <h2>Game Over!</h2>
              <p>Final Score: {score}</p>
              <button onClick={resetGame}>Play Again</button>
            </div>
          )}
          {isPaused && !gameOver && (
            <div className="pause-overlay">
              <h2>Paused</h2>
              <p>Tap Resume to continue</p>
            </div>
          )}
          <div className="tetris-board">
            {renderBoard()}
          </div>
        </div>

        <div className="mobile-controls">
          <div className="control-row">
            <button
              className="control-button action-button"
              onClick={() => setIsPaused(prev => !prev)}
              disabled={gameOver}
            >
              {isPaused ? '▶' : '⏸'}
            </button>
            <button
              className="control-button action-button"
              onClick={resetGame}
            >
              🔄
            </button>
          </div>
          <div className="control-row">
            <button
              className="control-button rotate-button"
              onClick={rotate}
              disabled={gameOver || isPaused}
            >
              ↻
            </button>
          </div>
          <div className="control-row main-controls">
            <button
              className="control-button direction-button"
              onClick={moveLeft}
              disabled={gameOver || isPaused}
            >
              ←
            </button>
            <button
              className="control-button direction-button"
              onClick={moveDown}
              disabled={gameOver || isPaused}
            >
              ↓
            </button>
            <button
              className="control-button direction-button"
              onClick={moveRight}
              disabled={gameOver || isPaused}
            >
              →
            </button>
          </div>
          <div className="control-row">
            <button
              className="control-button drop-button"
              onClick={drop}
              disabled={gameOver || isPaused}
            >
              DROP
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Tetris
