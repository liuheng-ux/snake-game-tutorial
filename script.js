// 游戏配置
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');

// 游戏状态
let gameRunning = false;
let gameLoop = null;
let score = 0;
let gameSpeed = 100; // 默认速度（毫秒）

// 网格设置
const gridSize = 20;
const tileCount = canvas.width / gridSize;

// 蛇的初始状态
let snake = [
    {x: 10, y: 10}
];

// 食物位置
let food = {
    x: Math.floor(Math.random() * tileCount),
    y: Math.floor(Math.random() * tileCount)
};

// 移动方向
let dx = 0;
let dy = 0;

// 难度配置
const difficulties = {
    150: { name: '简单', color: '#4CAF50', description: '适合新手，慢速移动' },
    120: { name: '中等', color: '#FF9800', description: '适中速度，平衡挑战' },
    100: { name: '困难', color: '#F44336', description: '快速移动，需要技巧' },
    70: { name: '地狱', color: '#9C27B0', description: '极速挑战，高手专属' }
};

// 初始化游戏
function init() {
    setupSpeedControls();
    drawGame();
    updateGameInfo();
}

// 设置速度控制按钮
function setupSpeedControls() {
    const speedButtons = document.querySelectorAll('.speed-btn');
    
    speedButtons.forEach(button => {
        button.addEventListener('click', () => {
            // 移除所有按钮的active类
            speedButtons.forEach(btn => btn.classList.remove('active'));
            // 给当前按钮添加active类
            button.classList.add('active');
            
            // 设置游戏速度
            gameSpeed = parseInt(button.dataset.speed);
            
            // 更新游戏信息
            updateGameInfo();
            
            // 如果游戏正在运行，重启游戏循环
            if (gameRunning) {
                clearInterval(gameLoop);
                startGameLoop();
            }
        });
    });
}

// 更新游戏信息显示
function updateGameInfo() {
    const difficulty = difficulties[gameSpeed];
    const infoDiv = document.querySelector('.game-info') || createGameInfoDiv();
    
    infoDiv.innerHTML = `
        <div class="controls-info">使用方向键 ↑↓←→ 控制蛇的移动</div>
        <div class="difficulty-info">当前难度: <strong style="color: ${difficulty.color}">${difficulty.name}</strong> - ${difficulty.description}</div>
    `;
}

// 创建游戏信息显示区域
function createGameInfoDiv() {
    const infoDiv = document.createElement('div');
    infoDiv.className = 'game-info';
    document.body.appendChild(infoDiv);
    return infoDiv;
}

// 开始游戏循环
function startGameLoop() {
    gameLoop = setInterval(gameStep, gameSpeed);
}

// 游戏主循环
function gameStep() {
    updateSnake();
    checkCollisions();
    drawGame();
}

// 更新蛇的位置
function updateSnake() {
    const head = {x: snake[0].x + dx, y: snake[0].y + dy};
    snake.unshift(head);
    
    // 检查是否吃到食物
    if (head.x === food.x && head.y === food.y) {
        score += 10;
        scoreElement.textContent = `Score: ${score}`;
        generateFood();
        
        // 添加吃食物的视觉效果
        addEatEffect();
    } else {
        snake.pop();
    }
}

// 检查碰撞
function checkCollisions() {
    const head = snake[0];
    
    // 检查墙壁碰撞
    if (head.x < 0 || head.x >= tileCount || head.y < 0 || head.y >= tileCount) {
        gameOver();
        return;
    }
    
    // 检查自身碰撞
    for (let i = 1; i < snake.length; i++) {
        if (head.x === snake[i].x && head.y === snake[i].y) {
            gameOver();
            return;
        }
    }
}

// 生成新食物
function generateFood() {
    food = {
        x: Math.floor(Math.random() * tileCount),
        y: Math.floor(Math.random() * tileCount)
    };
    
    // 确保食物不生成在蛇身上
    for (let segment of snake) {
        if (segment.x === food.x && segment.y === food.y) {
            generateFood();
            return;
        }
    }
}

// 绘制游戏
function drawGame() {
    // 清空画布
    ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // 绘制网格（可选）
    drawGrid();
    
    // 绘制蛇
    drawSnake();
    
    // 绘制食物
    drawFood();
}

// 绘制网格
function drawGrid() {
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.lineWidth = 1;
    
    for (let i = 0; i <= tileCount; i++) {
        ctx.beginPath();
        ctx.moveTo(i * gridSize, 0);
        ctx.lineTo(i * gridSize, canvas.height);
        ctx.stroke();
        
        ctx.beginPath();
        ctx.moveTo(0, i * gridSize);
        ctx.lineTo(canvas.width, i * gridSize);
        ctx.stroke();
    }
}

// 绘制蛇
function drawSnake() {
    snake.forEach((segment, index) => {
        if (index === 0) {
            // 蛇头
            ctx.fillStyle = '#4CAF50';
            ctx.fillRect(segment.x * gridSize + 2, segment.y * gridSize + 2, gridSize - 4, gridSize - 4);
            
            // 蛇头眼睛
            ctx.fillStyle = 'white';
            ctx.fillRect(segment.x * gridSize + 6, segment.y * gridSize + 6, 3, 3);
            ctx.fillRect(segment.x * gridSize + 11, segment.y * gridSize + 6, 3, 3);
        } else {
            // 蛇身
            const alpha = 1 - (index * 0.1);
            ctx.fillStyle = `rgba(76, 175, 80, ${Math.max(alpha, 0.3)})`;
            ctx.fillRect(segment.x * gridSize + 1, segment.y * gridSize + 1, gridSize - 2, gridSize - 2);
        }
    });
}

// 绘制食物
function drawFood() {
    // 食物主体
    ctx.fillStyle = '#FF5722';
    ctx.fillRect(food.x * gridSize + 2, food.y * gridSize + 2, gridSize - 4, gridSize - 4);
    
    // 食物高光效果
    ctx.fillStyle = '#FF8A65';
    ctx.fillRect(food.x * gridSize + 4, food.y * gridSize + 4, 6, 6);
}

// 添加吃食物的视觉效果
function addEatEffect() {
    canvas.style.filter = 'brightness(1.2)';
    setTimeout(() => {
        canvas.style.filter = 'brightness(1)';
    }, 100);
}

// 游戏结束
function gameOver() {
    gameRunning = false;
    clearInterval(gameLoop);
    
    // 显示游戏结束信息
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.fillStyle = 'white';
    ctx.font = '30px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('游戏结束!', canvas.width / 2, canvas.height / 2 - 30);
    
    ctx.font = '20px Arial';
    ctx.fillText(`最终得分: ${score}`, canvas.width / 2, canvas.height / 2 + 10);
    
    ctx.font = '16px Arial';
    ctx.fillText('按空格键重新开始', canvas.width / 2, canvas.height / 2 + 40);
    
    // 添加游戏结束类用于动画
    canvas.classList.add('game-over');
}

// 重置游戏
function resetGame() {
    snake = [{x: 10, y: 10}];
    dx = 0;
    dy = 0;
    score = 0;
    scoreElement.textContent = 'Score: 0';
    generateFood();
    canvas.classList.remove('game-over');
    gameRunning = false;
    clearInterval(gameLoop);
    drawGame();
}

// 开始游戏
function startGame() {
    if (!gameRunning && (dx !== 0 || dy !== 0)) {
        gameRunning = true;
        startGameLoop();
    }
}

// 键盘事件处理
document.addEventListener('keydown', (e) => {
    if (!gameRunning && e.code === 'Space') {
        resetGame();
        return;
    }
    
    // 防止快速按键导致蛇反向移动
    if (gameRunning) {
        switch(e.key) {
            case 'ArrowUp':
                if (dy !== 1) {
                    dx = 0;
                    dy = -1;
                }
                break;
            case 'ArrowDown':
                if (dy !== -1) {
                    dx = 0;
                    dy = 1;
                }
                break;
            case 'ArrowLeft':
                if (dx !== 1) {
                    dx = -1;
                    dy = 0;
                }
                break;
            case 'ArrowRight':
                if (dx !== -1) {
                    dx = 1;
                    dy = 0;
                }
                break;
        }
    } else {
        // 游戏未开始时，任意方向键开始游戏
        switch(e.key) {
            case 'ArrowUp':
                dx = 0;
                dy = -1;
                startGame();
                break;
            case 'ArrowDown':
                dx = 0;
                dy = 1;
                startGame();
                break;
            case 'ArrowLeft':
                dx = -1;
                dy = 0;
                startGame();
                break;
            case 'ArrowRight':
                dx = 1;
                dy = 0;
                startGame();
                break;
        }
    }
    
    e.preventDefault();
});

// 初始化游戏
init();