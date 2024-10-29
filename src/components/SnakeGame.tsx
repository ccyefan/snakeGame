import React, { useState, useEffect, useCallback } from 'react';
import { Gamepad2, Pause, Play, RotateCcw } from 'lucide-react';

type Position = {
  x: number;
  y: number;
};

const GRID_SIZE = 20;
const CELL_SIZE = 20;
const INITIAL_SPEED = 150;
const INITIAL_SNAKE = [
  { x: 8, y: 8 },
  { x: 8, y: 9 },
];

export default function SnakeGame() {
  const [snake, setSnake] = useState<Position[]>(INITIAL_SNAKE);
  const [food, setFood] = useState<Position>({ x: 5, y: 5 });
  const [direction, setDirection] = useState<string>('UP');
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [highScore, setHighScore] = useState(0);

  const generateFood = useCallback(() => {
    const newFood = {
      x: Math.floor(Math.random() * GRID_SIZE),
      y: Math.floor(Math.random() * GRID_SIZE),
    };
    return newFood;
  }, []);

  const resetGame = () => {
    setSnake(INITIAL_SNAKE);
    setFood(generateFood());
    setDirection('UP');
    setGameOver(false);
    setScore(0);
    setIsPaused(false);
  };

  const checkCollision = (head: Position) => {
    if (
      head.x < 0 ||
      head.x >= GRID_SIZE ||
      head.y < 0 ||
      head.y >= GRID_SIZE
    ) {
      return true;
    }

    for (const segment of snake.slice(1)) {
      if (head.x === segment.x && head.y === segment.y) {
        return true;
      }
    }
    return false;
  };

  const moveSnake = useCallback(() => {
    if (gameOver || isPaused) return;

    const head = { ...snake[0] };
    switch (direction) {
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

    if (checkCollision(head)) {
      setGameOver(true);
      if (score > highScore) {
        setHighScore(score);
      }
      return;
    }

    const newSnake = [head, ...snake];
    if (head.x === food.x && head.y === food.y) {
      setFood(generateFood());
      setScore(prev => prev + 10);
    } else {
      newSnake.pop();
    }
    setSnake(newSnake);
  }, [snake, direction, food, gameOver, isPaused, score, highScore, generateFood]);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowUp':
          if (direction !== 'DOWN') setDirection('UP');
          break;
        case 'ArrowDown':
          if (direction !== 'UP') setDirection('DOWN');
          break;
        case 'ArrowLeft':
          if (direction !== 'RIGHT') setDirection('LEFT');
          break;
        case 'ArrowRight':
          if (direction !== 'LEFT') setDirection('RIGHT');
          break;
        case ' ':
          setIsPaused(prev => !prev);
          break;
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [direction]);

  useEffect(() => {
    const gameInterval = setInterval(moveSnake, INITIAL_SPEED);
    return () => clearInterval(gameInterval);
  }, [moveSnake]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white p-4">
      <div className="mb-4 flex items-center gap-2">
        <Gamepad2 className="w-6 h-6" />
        <h1 className="text-2xl font-bold">贪吃蛇</h1>
      </div>
      
      <div className="flex gap-8 mb-4">
        <div className="text-center">
          <p className="text-gray-400">分数</p>
          <p className="text-xl font-bold">{score}</p>
        </div>
        <div className="text-center">
          <p className="text-gray-400">最高分</p>
          <p className="text-xl font-bold">{highScore}</p>
        </div>
      </div>

      <div className="relative bg-gray-700 rounded-lg overflow-hidden"
           style={{ width: GRID_SIZE * CELL_SIZE, height: GRID_SIZE * CELL_SIZE }}>
        {snake.map((segment, index) => (
          <div
            key={index}
            className="absolute bg-green-500 rounded-sm"
            style={{
              left: segment.x * CELL_SIZE,
              top: segment.y * CELL_SIZE,
              width: CELL_SIZE - 1,
              height: CELL_SIZE - 1,
              backgroundColor: index === 0 ? '#34D399' : '#10B981',
            }}
          />
        ))}
        <div
          className="absolute bg-red-500 rounded-full"
          style={{
            left: food.x * CELL_SIZE,
            top: food.y * CELL_SIZE,
            width: CELL_SIZE - 1,
            height: CELL_SIZE - 1,
          }}
        />
        
        {gameOver && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="text-center">
              <h2 className="text-xl font-bold mb-2">游戏结束!</h2>
              <p className="mb-4">最终得分: {score}</p>
              <button
                onClick={resetGame}
                className="px-4 py-2 bg-green-500 rounded hover:bg-green-600 transition-colors flex items-center gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                重新开始
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="mt-4 flex gap-4">
        <button
          onClick={() => setIsPaused(prev => !prev)}
          className="px-4 py-2 bg-blue-500 rounded hover:bg-blue-600 transition-colors flex items-center gap-2"
        >
          {isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
          {isPaused ? '继续' : '暂停'}
        </button>
        <button
          onClick={resetGame}
          className="px-4 py-2 bg-gray-500 rounded hover:bg-gray-600 transition-colors flex items-center gap-2"
        >
          <RotateCcw className="w-4 h-4" />
          重置
        </button>
      </div>

      <div className="mt-6 text-gray-400 text-sm">
        <p>使用方向键控制蛇的移动</p>
        <p>空格键暂停/继续游戏</p>
      </div>
    </div>
  );
}