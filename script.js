// Game constants
const GRID_SIZE = 20;
const CELL_SIZE = 20;
const INITIAL_SPEED = 150;

// Game variables
let snake = [{x: 10, y: 10}];
let food = generateFood();
let direction = {x: 0, y: 0};
let nextDirection = {x: 0, y: 0};
let gameSpeed = INITIAL_SPEED;
let score = 0;
let highScore = localStorage.getItem('snakeHighScore') || 0;
let gameActive = false; // Is the game loop running?
let gameReady = false;  // Is the game waiting for first input?
let gamePaused = false;
let gameLoop;

// DOM elements
const gameBoard = document.getElementById('game-board');
const ctx = gameBoard.getContext('2d');
const scoreDisplay = document.getElementById('score');
const highScoreDisplay = document.getElementById('high-score');
const pauseBtn = document.getElementById('pause-btn');
const restartBtn = document.getElementById('restart-btn');

// Initialize game
function initGame() {
    document.addEventListener('keydown', changeDirection);
    pauseBtn.addEventListener('click', togglePause);
    restartBtn.addEventListener('click', restartGame);
    highScoreDisplay.textContent = highScore;
    // Set game to ready state, waiting for first input
    gameReady = true;
    gameActive = false;
    drawSnake();
    drawFood();
}

// Main game loop
function gameUpdate() {
    if (gamePaused) return;

    // Update snake position
    direction = {...nextDirection};
    const head = {x: snake[0].x + direction.x, y: snake[0].y + direction.y};

    // Check collisions
    if (isCollision(head)) {
        gameOver();
        return;
    }

    // Move snake
    snake.unshift(head);
    
    // Check if food eaten
    if (head.x === food.x && head.y === food.y) {
        score += 10;
        scoreDisplay.textContent = score;
        food = generateFood();
        // Increase speed every 50 points
        if (score % 50 === 0) {
            gameSpeed = Math.max(gameSpeed - 10, 50);
            clearInterval(gameLoop);
            gameLoop = setInterval(gameUpdate, gameSpeed);
        }
    } else {
        snake.pop();
    }

    // Clear board and redraw
    ctx.clearRect(0, 0, gameBoard.width, gameBoard.height);
    drawFood();
    drawSnake();
}

// Drawing functions
function drawSnake() {
    snake.forEach((segment, index) => {
        ctx.fillStyle = index === 0 ? '#ffff00' : '#00ffcc'; // Bright yellow head, neon cyan body
        ctx.fillRect(segment.x * CELL_SIZE, segment.y * CELL_SIZE, CELL_SIZE, CELL_SIZE);
        ctx.strokeStyle = '#222'; // Dark grey stroke for definition
        ctx.strokeRect(segment.x * CELL_SIZE, segment.y * CELL_SIZE, CELL_SIZE, CELL_SIZE);
    });
}

function drawFood() {
    ctx.fillStyle = '#ff00ff'; // Neon pink food
    ctx.fillRect(food.x * CELL_SIZE, food.y * CELL_SIZE, CELL_SIZE, CELL_SIZE);
    // Add a subtle glow to food
    ctx.shadowColor = '#ff00ff';
    ctx.shadowBlur = 5;
    ctx.fillRect(food.x * CELL_SIZE, food.y * CELL_SIZE, CELL_SIZE, CELL_SIZE); // Redraw with shadow
    ctx.shadowBlur = 0; // Reset shadow
}

// Helper functions
function generateFood() {
    let newFood;
    do {
        newFood = {
            x: Math.floor(Math.random() * GRID_SIZE),
            y: Math.floor(Math.random() * GRID_SIZE)
        };
    } while (snake.some(segment => segment.x === newFood.x && segment.y === newFood.y));
    return newFood;
}

function isCollision(head) {
    return (
        head.x < 0 || head.x >= GRID_SIZE || 
        head.y < 0 || head.y >= GRID_SIZE ||
        snake.some(segment => segment.x === head.x && segment.y === head.y)
    );
}

function changeDirection(e) {
    const key = e.key;
    const validKeys = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'];

    if (gameReady && validKeys.includes(key)) {
        // Start the game on the first valid key press
        gameReady = false;
        startGame();
        // Allow the first move to be registered immediately
    } else if (!gameActive || gamePaused) {
        // Don't process direction changes if game isn't active or is paused
        return;
    }

    // Process direction change only if game is active
    if (key === 'ArrowUp' && direction.y === 0) {
        nextDirection = {x: 0, y: -1};
    } else if (key === 'ArrowDown' && direction.y === 0) {
        nextDirection = {x: 0, y: 1};
    } else if (key === 'ArrowLeft' && direction.x === 0) {
        nextDirection = {x: -1, y: 0};
    } else if (key === 'ArrowRight' && direction.x === 0) {
        nextDirection = {x: 1, y: 0};
    }
}

function startGame() {
    if (gameActive) return; // Prevent multiple intervals
    gameActive = true;
    gameLoop = setInterval(gameUpdate, gameSpeed);
}

function gameOver() {
    clearInterval(gameLoop);
    gameActive = false;
    gameReady = false; // Game is over, not ready for input
    if (score > highScore) {
        highScore = score;
        highScoreDisplay.textContent = highScore;
        localStorage.setItem('snakeHighScore', highScore);
    }
    alert(`Game Over! Your score: ${score}`);
}

function togglePause() {
    if (!gameActive) return; // Can only pause active game
    gamePaused = !gamePaused;
    pauseBtn.textContent = gamePaused ? 'Resume' : 'Pause';
}

function restartGame() {
    clearInterval(gameLoop);
    snake = [{x: 10, y: 10}];
    food = generateFood();
    direction = {x: 0, y: 0};
    nextDirection = {x: 0, y: 0};
    gameSpeed = INITIAL_SPEED;
    score = 0;
    scoreDisplay.textContent = score;
    gamePaused = false;
    pauseBtn.textContent = 'Pause';
    gameActive = false; // Stop game loop if running
    gameReady = true;   // Set to ready state, waiting for input
    // Clear and redraw board without starting game loop
    ctx.clearRect(0, 0, gameBoard.width, gameBoard.height);
    drawSnake();
    drawFood();
    // Game loop will start on first key press via changeDirection
}

// Start the game
initGame();
