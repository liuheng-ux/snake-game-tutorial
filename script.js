// --- 游戏设置 ---
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');
const gridSize = 20; // 每个格子的大小
const canvasSize = canvas.width;
let score = 0;
let gameOver = false;

// --- 游戏元素 ---
let snake = [
    { x: 10, y: 10 } // 蛇的初始位置 (单位：格子)
];
let food = {};
let direction = 'right';
let directionQueue = []; // 方向指令队列，防止快速按键导致180度掉头

// --- 初始化 ---
function initialize() {
    snake = [{ x: 10, y: 10 }];
    direction = 'right';
    directionQueue = [];
    score = 0;
    gameOver = false;
    updateScore(0);
    placeFood();
    hideGameOver();
}

// --- 游戏主循环 ---
function gameLoop() {
    if (gameOver) {
        showGameOver();
        return;
    }
    
    setTimeout(() => {
        clearCanvas();
        processDirection();
        moveSnake();
        drawFood();
        drawSnake();
        checkCollision();
        gameLoop();
    }, 100); // 游戏速度，数字越小越快
}

// --- 绘图函数 ---
function clearCanvas() {
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, canvasSize, canvasSize);
}

function drawSnake() {
    ctx.fillStyle = 'lime';
    snake.forEach(segment => {
        ctx.fillRect(segment.x * gridSize, segment.y * gridSize, gridSize - 1, gridSize - 1);
    });
}

function drawFood() {
    ctx.fillStyle = 'red';
    ctx.fillRect(food.x * gridSize, food.y * gridSize, gridSize, gridSize);
}

// --- 游戏逻辑 ---
function placeFood() {
    // 随机生成食物位置，并确保不在蛇身上
    let foodX, foodY, onSnake;
    do {
        onSnake = false;
        foodX = Math.floor(Math.random() * (canvasSize / gridSize));
        foodY = Math.floor(Math.random() * (canvasSize / gridSize));
        for (const segment of snake) {
            if (segment.x === foodX && segment.y === foodY) {
                onSnake = true;
                break;
            }
        }
    } while (onSnake);
    food = { x: foodX, y: foodY };
}

function moveSnake() {
    const head = { ...snake[0] }; // 复制蛇头
    switch (direction) {
        case 'up': head.y -= 1; break;
        case 'down': head.y += 1; break;
        case 'left': head.x -= 1; break;
        case 'right': head.x += 1; break;
    }
    snake.unshift(head); // 在前面添加新蛇头

    // 检查是否吃到食物
    if (head.x === food.x && head.y === food.y) {
        updateScore(score + 10);
        placeFood();
    } else {
        snake.pop(); // 如果没吃到，就移除蛇尾
    }
}

function checkCollision() {
    const head = snake[0];
    
    // 撞墙检测
    if (head.x < 0 || head.x >= canvasSize / gridSize || head.y < 0 || head.y >= canvasSize / gridSize) {
        gameOver = true;
    }
    
    // 撞自己检测
    for (let i = 1; i < snake.length; i++) {
        if (head.x === snake[i].x && head.y === snake[i].y) {
            gameOver = true;
            break;
        }
    }
}

function updateScore(newScore) {
    score = newScore;
    scoreElement.innerText = `Score: ${score}`;
}

function showGameOver() {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(0, 0, canvasSize, canvasSize);
    ctx.fillStyle = 'white';
    ctx.font = '30px "Courier New"';
    ctx.textAlign = 'center';
    ctx.fillText('GAME OVER', canvasSize / 2, canvasSize / 2 - 20);
    ctx.font = '16px "Courier New"';
    ctx.fillText('Press Enter to Restart', canvasSize / 2, canvasSize / 2 + 20);
}

// --- 事件监听 ---
document.addEventListener('keydown', e => {
    const key = e.key;
    if (key === 'Enter' && gameOver) {
        initialize();
        gameLoop();
        return;
    }

    // 将方向指令放入队列
    let newDirection;
    if (key === 'ArrowUp' || key.toLowerCase() === 'w') newDirection = 'up';
    if (key === 'ArrowDown' || key.toLowerCase() === 's') newDirection = 'down';
    if (key === 'ArrowLeft' || key.toLowerCase() === 'a') newDirection = 'left';
    if (key === 'ArrowRight' || key.toLowerCase() === 'd') newDirection = 'right';

    if (newDirection) {
        directionQueue.push(newDirection);
    }
});

function processDirection() {
    if (directionQueue.length > 0) {
        const nextDirection = directionQueue.shift();
        // 防止180度掉头
        const isOpposite = (dir1, dir2) => 
            (dir1 === 'up' && dir2 === 'down') || (dir1 === 'down' && dir2 === 'up') ||
            (dir1 === 'left' && dir2 === 'right') || (dir1 === 'right' && dir2 === 'left');
        
        if (!isOpposite(direction, nextDirection)) {
            direction = nextDirection;
        }
    }
}


// --- 启动游戏 ---
initialize();
gameLoop();