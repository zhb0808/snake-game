'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

// Game constants
const GRID_SIZE = 20;
const CELL_SIZE = 20;
const INITIAL_SPEED = 150;
const MIN_SPEED = 50;
const SPEED_INCREMENT = 5;

// Types
type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';
type Position = { x: number; y: number };
type GameStatus = 'IDLE' | 'RUNNING' | 'PAUSED' | 'GAME_OVER';

export default function SnakeGame() {
  // Game state
  const [snake, setSnake] = useState<Position[]>([{ x: 10, y: 10 }]);
  const [food, setFood] = useState<Position>({ x: 5, y: 5 });
  const [direction, setDirection] = useState<Direction>('RIGHT');
  const [nextDirection, setNextDirection] = useState<Direction>('RIGHT');
  const [gameStatus, setGameStatus] = useState<GameStatus>('IDLE');
  const [score, setScore] = useState(0);
  const [speed, setSpeed] = useState(INITIAL_SPEED);
  const [highScore, setHighScore] = useState(0);
  
  const gameLoopRef = useRef<number | null>(null);
  const directionRef = useRef<Direction>(direction);
  const gameStatusRef = useRef<GameStatus>(gameStatus);

  // Initialize game
  const initGame = useCallback(() => {
    setSnake([{ x: 10, y: 10 }]);
    setDirection('RIGHT');
    setNextDirection('RIGHT');
    directionRef.current = 'RIGHT';
    setScore(0);
    setSpeed(INITIAL_SPEED);
    generateFood({ x: 10, y: 10 });
    setGameStatus('RUNNING');
    gameStatusRef.current = 'RUNNING';
  }, []);

  // Generate food at random position
  const generateFood = useCallback((snakeHead: Position) => {
    let newFood: Position;
    do {
      newFood = {
        x: Math.floor(Math.random() * GRID_SIZE),
        y: Math.floor(Math.random() * GRID_SIZE)
      };
      // Make sure food doesn't appear on snake
    } while (
      newFood.x === snakeHead.x && 
      newFood.y === snakeHead.y
    );
    
    setFood(newFood);
  }, []);

  // Handle keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (gameStatusRef.current === 'GAME_OVER' && e.key === ' ') {
        initGame();
        return;
      }

      if (e.key === 'p' || e.key === 'P') {
        if (gameStatusRef.current === 'RUNNING') {
          setGameStatus('PAUSED');
          gameStatusRef.current = 'PAUSED';
        } else if (gameStatusRef.current === 'PAUSED') {
          setGameStatus('RUNNING');
          gameStatusRef.current = 'RUNNING';
        }
        return;
      }

      // Prevent 180-degree turns
      switch (e.key.toLowerCase()) {
        case 'arrowup':
        case 'w':
          if (directionRef.current !== 'DOWN') setNextDirection('UP');
          break;
        case 'arrowdown':
        case 's':
          if (directionRef.current !== 'UP') setNextDirection('DOWN');
          break;
        case 'arrowleft':
        case 'a':
          if (directionRef.current !== 'RIGHT') setNextDirection('LEFT');
          break;
        case 'arrowright':
        case 'd':
          if (directionRef.current !== 'LEFT') setNextDirection('RIGHT');
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [initGame]);

  // Game loop
  useEffect(() => {
    if (gameStatus !== 'RUNNING') return;

    const moveSnake = () => {
      setDirection(nextDirection);
      directionRef.current = nextDirection;

      setSnake(prevSnake => {
        const head = { ...prevSnake[0] };
        
        // Move head based on direction
        switch (nextDirection) {
          case 'UP':
            head.y -= 1;
            break;
          case 'DOWN':
            head.y += 1;
            break;
          case 'LEFT':
            head.x -= 1;
            break;
          case 'RIGHT':
            head.x += 1;
            break;
        }

        // Check wall collision
        if (
          head.x < 0 || 
          head.x >= GRID_SIZE || 
          head.y < 0 || 
          head.y >= GRID_SIZE
        ) {
          setGameStatus('GAME_OVER');
          gameStatusRef.current = 'GAME_OVER';
          if (score > highScore) setHighScore(score);
          return prevSnake;
        }

        // Check self collision
        if (prevSnake.some(segment => segment.x === head.x && segment.y === head.y)) {
          setGameStatus('GAME_OVER');
          gameStatusRef.current = 'GAME_OVER';
          if (score > highScore) setHighScore(score);
          return prevSnake;
        }

        const newSnake = [head, ...prevSnake];
        
        // Check food collision
        if (head.x === food.x && head.y === food.y) {
          // Increase score
          const newScore = score + 10;
          setScore(newScore);
          
          // Increase speed (up to a minimum)
          if (speed > MIN_SPEED) {
            setSpeed(prev => Math.max(MIN_SPEED, prev - SPEED_INCREMENT));
          }
          
          // Generate new food
          generateFood(head);
        } else {
          // Remove tail if no food was eaten
          newSnake.pop();
        }

        return newSnake;
      });
    };

    gameLoopRef.current = window.setTimeout(moveSnake, speed);
    
    return () => {
      if (gameLoopRef.current) {
        window.clearTimeout(gameLoopRef.current);
      }
    };
  }, [snake, food, direction, nextDirection, gameStatus, speed, score, highScore, generateFood]);

  // Initialize high score from localStorage
  useEffect(() => {
    const savedHighScore = localStorage.getItem('snakeHighScore');
    if (savedHighScore) {
      setHighScore(parseInt(savedHighScore, 10));
    }
  }, []);

  // Update high score in localStorage
  useEffect(() => {
    if (score > highScore) {
      setHighScore(score);
      localStorage.setItem('snakeHighScore', score.toString());
    }
  }, [score, highScore]);

  // Render game cell
  const renderCell = (x: number, y: number) => {
    // Check if this cell is part of the snake
    const isSnakeHead = snake[0].x === x && snake[0].y === y;
    const isSnakeBody = snake.slice(1).some(segment => segment.x === x && segment.y === y);
    const isFood = food.x === x && food.y === y;

    let cellClass = `w-5 h-5 sm:w-6 sm:h-6 border border-gray-800/30 `;

    if (isSnakeHead) {
      cellClass += 'bg-green-500 rounded-sm';
    } else if (isSnakeBody) {
      cellClass += 'bg-green-400';
    } else if (isFood) {
      cellClass += 'bg-red-500 rounded-full';
    } else {
      cellClass += 'bg-gray-100 dark:bg-gray-800';
    }

    return <div key={`${x}-${y}`} className={cellClass} />;
  };

  // Create game grid
  const renderGrid = () => {
    const grid = [];
    for (let y = 0; y < GRID_SIZE; y++) {
      const row = [];
      for (let x = 0; x < GRID_SIZE; x++) {
        row.push(renderCell(x, y));
      }
      grid.push(
        <div key={y} className="flex">
          {row}
        </div>
      );
    }
    return grid;
  };

  return (
    <div className="min-h-dvh bg-gradient-to-br from-indigo-50 to-cyan-100 dark:from-gray-900 dark:to-gray-800 flex flex-col items-center justify-center p-4">
      <div className="max-w-3xl w-full mx-auto">
        <div className="text-center mb-6">
          <h1 className="text-4xl font-bold text-gray-800 dark:text-white mb-2">Snake Game</h1>
          <p className="text-gray-600 dark:text-gray-300 mb-4">Use arrow keys or WASD to control the snake</p>
          
          <div className="flex justify-center gap-8 mb-4">
            <div className="bg-white dark:bg-gray-700 px-6 py-3 rounded-lg shadow-md">
              <p className="text-gray-500 dark:text-gray-300 text-sm">SCORE</p>
              <p className="text-2xl font-bold text-gray-800 dark:text-white">{score}</p>
            </div>
            <div className="bg-white dark:bg-gray-700 px-6 py-3 rounded-lg shadow-md">
              <p className="text-gray-500 dark:text-gray-300 text-sm">HIGH SCORE</p>
              <p className="text-2xl font-bold text-gray-800 dark:text-white">{highScore}</p>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center">
          <div 
            className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700"
            style={{ 
              width: GRID_SIZE * (CELL_SIZE + 2) + 20, 
              maxWidth: '100%',
              overflow: 'hidden'
            }}
          >
            <div className="relative">
              <div className="flex flex-col items-center">
                {renderGrid()}
              </div>
              
              {/* Game Over Overlay */}
              {gameStatus === 'GAME_OVER' && (
                <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center rounded-lg">
                  <h2 className="text-3xl font-bold text-white mb-4">Game Over!</h2>
                  <p className="text-xl text-white mb-6">Score: {score}</p>
                  <button
                    onClick={initGame}
                    className="bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 rounded-full transition-all transform hover:scale-105"
                  >
                    Play Again
                  </button>
                </div>
              )}
              
              {/* Pause Overlay */}
              {gameStatus === 'PAUSED' && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-lg">
                  <div className="text-center">
                    <h2 className="text-3xl font-bold text-white mb-4">Game Paused</h2>
                    <p className="text-white">Press P to resume</p>
                  </div>
                </div>
              )}
              
              {/* Start Overlay */}
              {gameStatus === 'IDLE' && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-lg">
                  <button
                    onClick={initGame}
                    className="bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-8 rounded-full text-xl transition-all transform hover:scale-105"
                  >
                    Start Game
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="mt-6 flex flex-wrap justify-center gap-4">
            <button
              onClick={() => {
                if (gameStatus === 'RUNNING') {
                  setGameStatus('PAUSED');
                  gameStatusRef.current = 'PAUSED';
                } else if (gameStatus === 'PAUSED') {
                  setGameStatus('RUNNING');
                  gameStatusRef.current = 'RUNNING';
                } else if (gameStatus === 'IDLE' || gameStatus === 'GAME_OVER') {
                  initGame();
                }
              }}
              className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-lg shadow-md transition-colors"
            >
              {gameStatus === 'RUNNING' ? 'Pause' : 
               gameStatus === 'PAUSED' ? 'Resume' : 
               gameStatus === 'GAME_OVER' ? 'Restart' : 'Start'}
            </button>
            
            <button
              onClick={initGame}
              className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-3 px-6 rounded-lg shadow-md transition-colors"
            >
              Reset
            </button>
          </div>

          {/* Mobile Controls */}
          <div className="mt-8 md:hidden">
            <div className="grid grid-cols-3 gap-2 max-w-[200px] mx-auto">
              <div></div>
              <button
                onClick={() => {
                  if (directionRef.current !== 'DOWN') setNextDirection('UP');
                }}
                className="bg-gray-200 dark:bg-gray-700 h-14 flex items-center justify-center rounded-lg shadow-md active:bg-gray-300 dark:active:bg-gray-600"
                aria-label="Move Up"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-700 dark:text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                </svg>
              </button>
              <div></div>
              
              <button
                onClick={() => {
                  if (directionRef.current !== 'RIGHT') setNextDirection('LEFT');
                }}
                className="bg-gray-200 dark:bg-gray-700 h-14 flex items-center justify-center rounded-lg shadow-md active:bg-gray-300 dark:active:bg-gray-600"
                aria-label="Move Left"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-700 dark:text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              
              <button
                onClick={() => setGameStatus(gameStatus === 'RUNNING' ? 'PAUSED' : 'RUNNING')}
                className="bg-gray-200 dark:bg-gray-700 h-14 flex items-center justify-center rounded-lg shadow-md active:bg-gray-300 dark:active:bg-gray-600"
                aria-label="Pause/Resume"
              >
                <span className="text-gray-700 dark:text-gray-300 font-bold">P</span>
              </button>
              
              <button
                onClick={() => {
                  if (directionRef.current !== 'LEFT') setNextDirection('RIGHT');
                }}
                className="bg-gray-200 dark:bg-gray-700 h-14 flex items-center justify-center rounded-lg shadow-md active:bg-gray-300 dark:active:bg-gray-600"
                aria-label="Move Right"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-700 dark:text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
              
              <div></div>
              <button
                onClick={() => {
                  if (directionRef.current !== 'UP') setNextDirection('DOWN');
                }}
                className="bg-gray-200 dark:bg-gray-700 h-14 flex items-center justify-center rounded-lg shadow-md active:bg-gray-300 dark:active:bg-gray-600"
                aria-label="Move Down"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-700 dark:text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              <div></div>
            </div>
          </div>

          <div className="mt-8 text-center text-gray-600 dark:text-gray-400">
            <p className="mb-2">Controls:</p>
            <div className="flex flex-wrap justify-center gap-4">
              <span className="bg-gray-200 dark:bg-gray-700 px-3 py-1 rounded">Arrow Keys</span>
              <span className="bg-gray-200 dark:bg-gray-700 px-3 py-1 rounded">WASD</span>
              <span className="bg-gray-200 dark:bg-gray-700 px-3 py-1 rounded">P - Pause</span>
              <span className="bg-gray-200 dark:bg-gray-700 px-3 py-1 rounded">Space - Restart</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
