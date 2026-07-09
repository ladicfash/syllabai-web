import { useState, useEffect, useRef } from "react";
import { X } from "lucide-react";

interface SnakeGameProps {
  onClose: () => void;
}

const GRID_SIZE = 20;
const CELL_SIZE = 20;
const INITIAL_SPEED = 100;

export function SnakeGame({ onClose }: SnakeGameProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [snake, setSnake] = useState<[number, number][]>([[10, 10]]);
  const [food, setFood] = useState<[number, number]>([15, 15]);
  const [direction, setDirection] = useState<[number, number]>([1, 0]);
  const [nextDirection, setNextDirection] = useState<[number, number]>([1, 0]);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(() => {
    const saved = localStorage.getItem("snakeHighScore");
    return saved ? parseInt(saved) : 0;
  });
  const gameLoopRef = useRef<NodeJS.Timeout | null>(null);

  // Generate random food position
  const generateFood = () => {
    let newFood: [number, number];
    do {
      newFood = [
        Math.floor(Math.random() * GRID_SIZE),
        Math.floor(Math.random() * GRID_SIZE),
      ];
    } while (snake.some((segment) => segment[0] === newFood[0] && segment[1] === newFood[1]));
    return newFood;
  };

  // Game loop
  useEffect(() => {
    if (gameOver) return;

    gameLoopRef.current = setInterval(() => {
      setSnake((prevSnake) => {
        const newHead: [number, number] = [
          (prevSnake[0][0] + nextDirection[0] + GRID_SIZE) % GRID_SIZE,
          (prevSnake[0][1] + nextDirection[1] + GRID_SIZE) % GRID_SIZE,
        ];

        // Check self collision
        if (prevSnake.some((segment) => segment[0] === newHead[0] && segment[1] === newHead[1])) {
          setGameOver(true);
          return prevSnake;
        }

        let newSnake = [newHead, ...prevSnake];

        // Check food collision
        if (newHead[0] === food[0] && newHead[1] === food[1]) {
          setScore((s) => s + 10);
          setFood(generateFood());
        } else {
          newSnake = newSnake.slice(0, -1);
        }

        setDirection(nextDirection);
        return newSnake;
      });
    }, INITIAL_SPEED);

    return () => {
      if (gameLoopRef.current) clearInterval(gameLoopRef.current);
    };
  }, [gameOver, nextDirection, food, snake]);

  // Draw game
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Clear canvas
    ctx.fillStyle = "#0f172a";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw grid
    ctx.strokeStyle = "#1e293b";
    ctx.lineWidth = 0.5;
    for (let i = 0; i <= GRID_SIZE; i++) {
      ctx.beginPath();
      ctx.moveTo(i * CELL_SIZE, 0);
      ctx.lineTo(i * CELL_SIZE, canvas.height);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(0, i * CELL_SIZE);
      ctx.lineTo(canvas.width, i * CELL_SIZE);
      ctx.stroke();
    }

    // Draw snake with gradient
    snake.forEach((segment, index) => {
      const hue = (index / snake.length) * 360;
      ctx.fillStyle = `hsl(${hue}, 100%, 50%)`;
      ctx.fillRect(
        segment[0] * CELL_SIZE + 1,
        segment[1] * CELL_SIZE + 1,
        CELL_SIZE - 2,
        CELL_SIZE - 2
      );
    });

    // Draw food (S logo style)
    ctx.fillStyle = "#fbbf24";
    ctx.beginPath();
    ctx.arc(
      food[0] * CELL_SIZE + CELL_SIZE / 2,
      food[1] * CELL_SIZE + CELL_SIZE / 2,
      CELL_SIZE / 2 - 2,
      0,
      Math.PI * 2
    );
    ctx.fill();
  }, [snake, food]);

  // Handle keyboard input
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      switch (e.key) {
        case "ArrowUp":
          if (direction[1] === 0) setNextDirection([0, -1]);
          e.preventDefault();
          break;
        case "ArrowDown":
          if (direction[1] === 0) setNextDirection([0, 1]);
          e.preventDefault();
          break;
        case "ArrowLeft":
          if (direction[0] === 0) setNextDirection([-1, 0]);
          e.preventDefault();
          break;
        case "ArrowRight":
          if (direction[0] === 0) setNextDirection([1, 0]);
          e.preventDefault();
          break;
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [direction]);

  const handleRestart = () => {
    if (score > highScore) {
      setHighScore(score);
      localStorage.setItem("snakeHighScore", score.toString());
    }
    setSnake([[10, 10]]);
    setFood(generateFood());
    setDirection([1, 0]);
    setNextDirection([1, 0]);
    setScore(0);
    setGameOver(false);
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-slate-900 border border-blue-500/30 rounded-lg p-6 max-w-2xl w-full mx-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-transparent bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text">
            SyllabAI Snake
          </h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-slate-800 rounded transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex gap-4 mb-4">
          <div>
            <p className="text-sm text-muted-foreground">Score</p>
            <p className="text-2xl font-bold text-blue-400">{score}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">High Score</p>
            <p className="text-2xl font-bold text-cyan-400">{highScore}</p>
          </div>
        </div>

        <div className="bg-slate-950 rounded border border-slate-700 p-2 mb-4 flex justify-center">
          <canvas
            ref={canvasRef}
            width={GRID_SIZE * CELL_SIZE}
            height={GRID_SIZE * CELL_SIZE}
            className="border border-slate-600"
          />
        </div>

        {gameOver && (
          <div className="text-center mb-4">
            <p className="text-lg font-semibold text-red-400 mb-2">Game Over!</p>
            <p className="text-sm text-muted-foreground mb-4">
              Final Score: {score} | High Score: {Math.max(score, highScore)}
            </p>
          </div>
        )}

        <div className="flex gap-2 justify-center">
          {gameOver ? (
            <button
              onClick={handleRestart}
              className="px-4 py-2 bg-blue-500 hover:bg-blue-600 rounded font-semibold transition"
            >
              Play Again
            </button>
          ) : (
            <p className="text-xs text-muted-foreground text-center">
              Use arrow keys to move. Eat the yellow dots to grow!
            </p>
          )}
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded font-semibold transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
