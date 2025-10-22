import { useState, useEffect, useCallback } from 'react';
import './Calculator.css';

function Calculator() {
  const [display, setDisplay] = useState('0');
  const [previousValue, setPreviousValue] = useState(null);
  const [operation, setOperation] = useState(null);
  const [waitingForOperand, setWaitingForOperand] = useState(false);
  const [memory, setMemory] = useState(0);
  const [history, setHistory] = useState([]);
  const [isScientific, setIsScientific] = useState(true);
  const [angleMode, setAngleMode] = useState('deg'); // 'deg' or 'rad'

  const addToHistory = useCallback((expression, result) => {
    setHistory(prev => [{
      expression,
      result,
      timestamp: new Date().toLocaleTimeString()
    }, ...prev].slice(0, 10)); // Keep last 10 calculations
  }, []);

  const toRadians = (degrees) => degrees * (Math.PI / 180);
  const toDegrees = (radians) => radians * (180 / Math.PI);

  const performOperation = useCallback((nextValue, nextOperation) => {
    const inputValue = parseFloat(nextValue);

    if (previousValue === null) {
      setPreviousValue(inputValue);
    } else if (operation) {
      const currentValue = previousValue || 0;
      let newValue = currentValue;
      const expression = `${currentValue} ${operation} ${inputValue}`;

      switch (operation) {
        case '+':
          newValue = currentValue + inputValue;
          break;
        case '-':
          newValue = currentValue - inputValue;
          break;
        case '×':
          newValue = currentValue * inputValue;
          break;
        case '÷':
          newValue = inputValue !== 0 ? currentValue / inputValue : 'Error';
          break;
        case '^':
          newValue = Math.pow(currentValue, inputValue);
          break;
        case 'mod':
          newValue = currentValue % inputValue;
          break;
        default:
          break;
      }

      if (nextOperation === '=') {
        addToHistory(expression, newValue);
      }

      setPreviousValue(newValue);
      setDisplay(String(newValue));
    }

    setWaitingForOperand(true);
    setOperation(nextOperation);
  }, [previousValue, operation, addToHistory]);

  const handleNumber = useCallback((num) => {
    if (waitingForOperand) {
      setDisplay(String(num));
      setWaitingForOperand(false);
    } else {
      setDisplay(display === '0' ? String(num) : display + num);
    }
  }, [display, waitingForOperand]);

  const handleDecimal = useCallback(() => {
    if (waitingForOperand) {
      setDisplay('0.');
      setWaitingForOperand(false);
    } else if (display.indexOf('.') === -1) {
      setDisplay(display + '.');
    }
  }, [display, waitingForOperand]);

  const handleClear = useCallback(() => {
    setDisplay('0');
    setPreviousValue(null);
    setOperation(null);
    setWaitingForOperand(false);
  }, []);

  const handleScientific = useCallback((func) => {
    const value = parseFloat(display);
    let result;
    const expression = `${func}(${value})`;

    switch (func) {
      case 'sin':
        result = angleMode === 'deg' ? Math.sin(toRadians(value)) : Math.sin(value);
        break;
      case 'cos':
        result = angleMode === 'deg' ? Math.cos(toRadians(value)) : Math.cos(value);
        break;
      case 'tan':
        result = angleMode === 'deg' ? Math.tan(toRadians(value)) : Math.tan(value);
        break;
      case 'ln':
        result = value > 0 ? Math.log(value) : 'Error';
        break;
      case 'log':
        result = value > 0 ? Math.log10(value) : 'Error';
        break;
      case 'sqrt':
        result = value >= 0 ? Math.sqrt(value) : 'Error';
        break;
      case '1/x':
        result = value !== 0 ? 1 / value : 'Error';
        break;
      case 'x²':
        result = value * value;
        break;
      case 'x³':
        result = Math.pow(value, 3);
        break;
      case '∛':
        result = Math.cbrt(value);
        break;
      case 'e^x':
        result = Math.exp(value);
        break;
      case '10^x':
        result = Math.pow(10, value);
        break;
      case 'abs':
        result = Math.abs(value);
        break;
      case 'factorial':
        if (value < 0 || !Number.isInteger(value)) {
          result = 'Error';
        } else if (value > 170) {
          result = 'Infinity';
        } else {
          result = 1;
          for (let i = 2; i <= value; i++) {
            result *= i;
          }
        }
        break;
      default:
        return;
    }

    addToHistory(expression, result);
    setDisplay(String(result));
    setWaitingForOperand(true);
  }, [display, angleMode, addToHistory]);

  const handleMemory = useCallback((action) => {
    const value = parseFloat(display);
    switch (action) {
      case 'MC':
        setMemory(0);
        break;
      case 'MR':
        setDisplay(String(memory));
        setWaitingForOperand(true);
        break;
      case 'M+':
        setMemory(memory + value);
        break;
      case 'M-':
        setMemory(memory - value);
        break;
      case 'MS':
        setMemory(value);
        break;
      default:
        break;
    }
  }, [display, memory]);

  const handleConstant = useCallback((constant) => {
    let value;
    switch (constant) {
      case 'π':
        value = Math.PI;
        break;
      case 'e':
        value = Math.E;
        break;
      default:
        return;
    }
    setDisplay(String(value));
    setWaitingForOperand(true);
  }, []);

  const handlePlusMinus = useCallback(() => {
    const value = parseFloat(display);
    setDisplay(String(-value));
  }, [display]);

  const handlePercentage = useCallback(() => {
    const value = parseFloat(display);
    setDisplay(String(value / 100));
  }, [display]);

  const handleBackspace = useCallback(() => {
    if (!waitingForOperand) {
      const newDisplay = display.length > 1 ? display.slice(0, -1) : '0';
      setDisplay(newDisplay);
    }
  }, [display, waitingForOperand]);

  // Keyboard support
  useEffect(() => {
    const handleKeyDown = (e) => {
      e.preventDefault();

      if (e.key >= '0' && e.key <= '9') {
        handleNumber(e.key);
      } else if (e.key === '.') {
        handleDecimal();
      } else if (e.key === '+') {
        performOperation(display, '+');
      } else if (e.key === '-') {
        performOperation(display, '-');
      } else if (e.key === '*') {
        performOperation(display, '×');
      } else if (e.key === '/') {
        performOperation(display, '÷');
      } else if (e.key === 'Enter' || e.key === '=') {
        performOperation(display, '=');
      } else if (e.key === 'Escape' || e.key === 'c' || e.key === 'C') {
        handleClear();
      } else if (e.key === 'Backspace') {
        handleBackspace();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [display, handleNumber, handleDecimal, performOperation, handleClear, handleBackspace]);

  const clearHistory = () => {
    setHistory([]);
  };

  return (
    <div className="calculator-container">
      <div className="calculator-wrapper">
        <div className="calculator-main">
          <div className="calculator-header">
            <h1>Scientific Calculator</h1>
            <div className="calculator-modes">
              <button
                className={`mode-btn ${angleMode === 'deg' ? 'active' : ''}`}
                onClick={() => setAngleMode('deg')}
              >
                DEG
              </button>
              <button
                className={`mode-btn ${angleMode === 'rad' ? 'active' : ''}`}
                onClick={() => setAngleMode('rad')}
              >
                RAD
              </button>
              {memory !== 0 && <span className="memory-indicator">M</span>}
            </div>
          </div>

          <div className="calculator-display">
            <div className="display-value">{display}</div>
            {operation && previousValue !== null && (
              <div className="display-operation">{previousValue} {operation}</div>
            )}
          </div>

          <div className="calculator-buttons">
            {/* Memory & Clear Row */}
            <button className="btn btn-memory" onClick={() => handleMemory('MC')}>MC</button>
            <button className="btn btn-memory" onClick={() => handleMemory('MR')}>MR</button>
            <button className="btn btn-memory" onClick={() => handleMemory('M+')}>M+</button>
            <button className="btn btn-memory" onClick={() => handleMemory('M-')}>M-</button>
            <button className="btn btn-memory" onClick={() => handleMemory('MS')}>MS</button>
            <button className="btn btn-clear" onClick={handleClear}>C</button>

            {/* Scientific Functions Row 1 */}
            <button className="btn btn-function" onClick={() => handleScientific('sin')}>sin</button>
            <button className="btn btn-function" onClick={() => handleScientific('cos')}>cos</button>
            <button className="btn btn-function" onClick={() => handleScientific('tan')}>tan</button>
            <button className="btn btn-function" onClick={() => handleScientific('ln')}>ln</button>
            <button className="btn btn-function" onClick={() => handleScientific('log')}>log</button>
            <button className="btn btn-operator" onClick={handleBackspace}>⌫</button>

            {/* Scientific Functions Row 2 */}
            <button className="btn btn-function" onClick={() => handleScientific('x²')}>x²</button>
            <button className="btn btn-function" onClick={() => handleScientific('x³')}>x³</button>
            <button className="btn btn-function" onClick={() => performOperation(display, '^')}>x^y</button>
            <button className="btn btn-function" onClick={() => handleScientific('e^x')}>e^x</button>
            <button className="btn btn-function" onClick={() => handleScientific('10^x')}>10^x</button>
            <button className="btn btn-operator" onClick={() => performOperation(display, '÷')}>÷</button>

            {/* Scientific Functions Row 3 */}
            <button className="btn btn-function" onClick={() => handleScientific('sqrt')}>√</button>
            <button className="btn btn-function" onClick={() => handleScientific('∛')}>∛</button>
            <button className="btn btn-function" onClick={() => handleScientific('1/x')}>1/x</button>
            <button className="btn btn-function" onClick={() => handleScientific('abs')}>|x|</button>
            <button className="btn btn-function" onClick={() => handleScientific('factorial')}>n!</button>
            <button className="btn btn-operator" onClick={() => performOperation(display, '×')}>×</button>

            {/* Numbers & Operations Row 1 */}
            <button className="btn btn-number" onClick={() => handleNumber('7')}>7</button>
            <button className="btn btn-number" onClick={() => handleNumber('8')}>8</button>
            <button className="btn btn-number" onClick={() => handleNumber('9')}>9</button>
            <button className="btn btn-function" onClick={() => handleConstant('π')}>π</button>
            <button className="btn btn-function" onClick={() => handleConstant('e')}>e</button>
            <button className="btn btn-operator" onClick={() => performOperation(display, '-')}>-</button>

            {/* Numbers & Operations Row 2 */}
            <button className="btn btn-number" onClick={() => handleNumber('4')}>4</button>
            <button className="btn btn-number" onClick={() => handleNumber('5')}>5</button>
            <button className="btn btn-number" onClick={() => handleNumber('6')}>6</button>
            <button className="btn btn-function" onClick={() => performOperation(display, 'mod')}>mod</button>
            <button className="btn btn-function" onClick={handlePercentage}>%</button>
            <button className="btn btn-operator" onClick={() => performOperation(display, '+')}>+</button>

            {/* Numbers & Operations Row 3 */}
            <button className="btn btn-number" onClick={() => handleNumber('1')}>1</button>
            <button className="btn btn-number" onClick={() => handleNumber('2')}>2</button>
            <button className="btn btn-number" onClick={() => handleNumber('3')}>3</button>
            <button className="btn btn-number btn-zero" onClick={() => handleNumber('0')}>0</button>
            <button className="btn btn-number" onClick={handleDecimal}>.</button>
            <button className="btn btn-operator" onClick={handlePlusMinus}>±</button>

            {/* Equals Button */}
            <button className="btn btn-equals" onClick={() => performOperation(display, '=')}>=</button>
          </div>
        </div>

        {/* History Panel */}
        <div className="calculator-history">
          <div className="history-header">
            <h3>History</h3>
            {history.length > 0 && (
              <button className="clear-history-btn" onClick={clearHistory}>Clear</button>
            )}
          </div>
          <div className="history-list">
            {history.length === 0 ? (
              <p className="history-empty">No calculations yet</p>
            ) : (
              history.map((item, index) => (
                <div key={index} className="history-item">
                  <div className="history-expression">{item.expression}</div>
                  <div className="history-result">= {item.result}</div>
                  <div className="history-time">{item.timestamp}</div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <div className="calculator-info">
        <h3>Features</h3>
        <ul>
          <li>Basic arithmetic operations (+, -, ×, ÷)</li>
          <li>Scientific functions (sin, cos, tan, log, ln)</li>
          <li>Power and root functions (x², x³, x^y, √, ∛)</li>
          <li>Memory operations (MC, MR, M+, M-, MS)</li>
          <li>Constants (π, e)</li>
          <li>Angle modes (Degrees/Radians)</li>
          <li>Calculation history</li>
          <li>Keyboard support (numbers, operators, Enter, Esc, Backspace)</li>
        </ul>
      </div>
    </div>
  );
}

export default Calculator;
