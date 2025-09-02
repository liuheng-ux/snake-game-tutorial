// 游戏配置 - 延迟初始化
let canvas, ctx, scoreElement;

// 游戏状态
let gameRunning = false;
let gameLoop = null;
let score = 0;
let gameSpeed = 100; // 默认速度（毫秒）

// 网格设置
const gridSize = 20;
let tileCount = 20; // 默认值，将在init中重新计算

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

// 英雄榜相关变量
let leaderboard = [];
const MAX_LEADERBOARD_SIZE = 10;

// 初始化游戏
function init() {
    // 首先获取DOM元素
    canvas = document.getElementById('gameCanvas');
    scoreElement = document.getElementById('score');
    
    if (!canvas || !scoreElement) {
        console.error('关键DOM元素未找到');
        return;
    }
    
    ctx = canvas.getContext('2d');
    
    // 计算网格数量
    tileCount = canvas.width / gridSize;
    
    setupSpeedControls();
    drawGame();
    updateGameInfo();
    
    // 延迟设置英雄榜，确保DOM完全加载
    setTimeout(() => {
        setupLeaderboard();
        loadLeaderboard();
    }, 100);
}

// 设置速度控制按钮
function setupSpeedControls() {
    const speedButtons = document.querySelectorAll('.speed-btn');
    
    speedButtons.forEach(button => {
        button.addEventListener('click', () => {
            speedButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            gameSpeed = parseInt(button.dataset.speed);
            updateGameInfo();
            
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
        <div class="controls-info">使用方向键 ↑↓←→ 或 WASD 控制蛇的移动</div>
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
    
    if (head.x === food.x && head.y === food.y) {
        score += 10;
        scoreElement.textContent = `Score: ${score}`;
        generateFood();
        addEatEffect();
    } else {
        snake.pop();
    }
}

// 检查碰撞
function checkCollisions() {
    const head = snake[0];
    
    if (head.x < 0 || head.x >= tileCount || head.y < 0 || head.y >= tileCount) {
        gameOver();
        return;
    }
    
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
    
    for (let segment of snake) {
        if (segment.x === food.x && segment.y === food.y) {
            generateFood();
            return;
        }
    }
}

// 绘制游戏
function drawGame() {
    // 如果游戏未运行，完全清空画布
    if (!gameRunning) {
        ctx.fillStyle = 'rgba(0, 0, 0, 1)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    } else {
        // 游戏运行时使用半透明效果
        ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
    
    drawGrid();
    drawSnake();
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
            ctx.fillStyle = '#4CAF50';
            ctx.fillRect(segment.x * gridSize + 2, segment.y * gridSize + 2, gridSize - 4, gridSize - 4);
            
            ctx.fillStyle = 'white';
            ctx.fillRect(segment.x * gridSize + 6, segment.y * gridSize + 6, 3, 3);
            ctx.fillRect(segment.x * gridSize + 11, segment.y * gridSize + 6, 3, 3);
        } else {
            const alpha = 1 - (index * 0.1);
            ctx.fillStyle = `rgba(76, 175, 80, ${Math.max(alpha, 0.3)})`;
            ctx.fillRect(segment.x * gridSize + 1, segment.y * gridSize + 1, gridSize - 2, gridSize - 2);
        }
    });
}

// 绘制食物
function drawFood() {
    ctx.fillStyle = '#FF5722';
    ctx.fillRect(food.x * gridSize + 2, food.y * gridSize + 2, gridSize - 4, gridSize - 4);
    
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
    if (gameLoop) {
        clearInterval(gameLoop);
        gameLoop = null;
    }
    
    // 保存分数到英雄榜
    saveScore(score, gameSpeed);
    
    ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.fillStyle = 'white';
    ctx.font = 'bold 30px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('游戏结束!', canvas.width / 2, canvas.height / 2 - 40);
    
    ctx.font = '20px Arial';
    ctx.fillText(`最终得分: ${score}`, canvas.width / 2, canvas.height / 2 - 10);
    
    ctx.font = '16px Arial';
    ctx.fillText('按空格键重新开始', canvas.width / 2, canvas.height / 2 + 20);
    ctx.fillText('或按方向键直接开始新游戏', canvas.width / 2, canvas.height / 2 + 45);
    
    canvas.classList.add('game-over');
}

// 重置游戏
function resetGame() {
    // 停止当前游戏循环
    if (gameLoop) {
        clearInterval(gameLoop);
        gameLoop = null;
    }
    
    // 重置游戏状态
    gameRunning = false;
    snake = [{x: 10, y: 10}];
    dx = 0;
    dy = 0;
    score = 0;
    scoreElement.textContent = 'Score: 0';
    
    // 重置画布样式
    canvas.classList.remove('game-over');
    canvas.style.filter = 'brightness(1)';
    
    // 生成新食物并重绘
    generateFood();
    
    // 清空画布并重新绘制初始状态
    ctx.fillStyle = 'rgba(0, 0, 0, 1)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
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
    
    if (gameRunning) {
        switch(e.key) {
            case 'ArrowUp':
            case 'w':
            case 'W':
                if (dy !== 1) {
                    dx = 0;
                    dy = -1;
                }
                break;
            case 'ArrowDown':
            case 's':
            case 'S':
                if (dy !== -1) {
                    dx = 0;
                    dy = 1;
                }
                break;
            case 'ArrowLeft':
            case 'a':
            case 'A':
                if (dx !== 1) {
                    dx = -1;
                    dy = 0;
                }
                break;
            case 'ArrowRight':
            case 'd':
            case 'D':
                if (dx !== -1) {
                    dx = 1;
                    dy = 0;
                }
                break;
        }
    } else {
        switch(e.key) {
            case 'ArrowUp':
            case 'w':
            case 'W':
                dx = 0;
                dy = -1;
                startGame();
                break;
            case 'ArrowDown':
            case 's':
            case 'S':
                dx = 0;
                dy = 1;
                startGame();
                break;
            case 'ArrowLeft':
            case 'a':
            case 'A':
                dx = -1;
                dy = 0;
                startGame();
                break;
            case 'ArrowRight':
            case 'd':
            case 'D':
                dx = 1;
                dy = 0;
                startGame();
                break;
        }
    }
    
    e.preventDefault();
});

// 英雄榜功能
function setupLeaderboard() {
    const leaderboardBtn = document.getElementById('leaderboardBtn');
    const clearScoresBtn = document.getElementById('clearScoresBtn');
    const modal = document.getElementById('leaderboardModal');
    const closeBtn = document.querySelector('.close');
    
    // 检查元素是否存在
    if (!leaderboardBtn || !clearScoresBtn || !modal || !closeBtn) {
        console.error('英雄榜元素未找到:', {
            leaderboardBtn: !!leaderboardBtn,
            clearScoresBtn: !!clearScoresBtn,
            modal: !!modal,
            closeBtn: !!closeBtn
        });
        return;
    }
    
    console.log('英雄榜元素绑定成功');
    
    // 显示英雄榜
    leaderboardBtn.addEventListener('click', (e) => {
        e.preventDefault();
        console.log('显示英雄榜');
        displayLeaderboard();
        modal.style.display = 'block';
    });
    
    // 清空记录
    clearScoresBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        console.log('点击清空记录按钮');
        
        if (confirm('确定要清空所有记录吗？这个操作不可撤销！')) {
            console.log('用户确认清空');
            clearLeaderboard();
            
            // 检查是否真的清空了
            const saved = localStorage.getItem('snakeGameLeaderboard');
            if (!saved && leaderboard.length === 0) {
                alert('记录已成功清空！');
            } else {
                alert('清空失败，请重试');
                console.error('清空失败，localStorage:', saved, 'leaderboard:', leaderboard);
            }
        } else {
            console.log('用户取消清空');
        }
    });
    
    // 关闭弹窗
    closeBtn.addEventListener('click', (e) => {
        e.preventDefault();
        modal.style.display = 'none';
    });
    
    // 点击弹窗外部关闭
    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.style.display = 'none';
        }
    });
}

// 保存分数
function saveScore(finalScore, difficulty) {
    if (finalScore === 0) return; // 不保存0分
    
    const scoreEntry = {
        score: finalScore,
        difficulty: difficulties[difficulty].name,
        difficultySpeed: difficulty,
        date: new Date().toLocaleDateString('zh-CN'),
        time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
    };
    
    leaderboard.push(scoreEntry);
    
    // 按分数排序（降序）
    leaderboard.sort((a, b) => b.score - a.score);
    
    // 只保留前10名
    if (leaderboard.length > MAX_LEADERBOARD_SIZE) {
        leaderboard = leaderboard.slice(0, MAX_LEADERBOARD_SIZE);
    }
    
    // 保存到localStorage
    localStorage.setItem('snakeGameLeaderboard', JSON.stringify(leaderboard));
}

// 加载英雄榜
function loadLeaderboard() {
    const saved = localStorage.getItem('snakeGameLeaderboard');
    if (saved) {
        leaderboard = JSON.parse(saved);
    }
}

// 显示英雄榜
function displayLeaderboard() {
    const leaderboardList = document.getElementById('leaderboardList');
    
    if (leaderboard.length === 0) {
        leaderboardList.innerHTML = '<div class="no-scores">暂无记录，快去创造第一个记录吧！</div>';
        return;
    }
    
    let html = '';
    leaderboard.forEach((entry, index) => {
        const rank = index + 1;
        let rankClass = '';
        let rankIcon = '';
        
        if (rank === 1) {
            rankClass = 'first';
            rankIcon = '🥇';
        } else if (rank === 2) {
            rankClass = 'second';
            rankIcon = '🥈';
        } else if (rank === 3) {
            rankClass = 'third';
            rankIcon = '🥉';
        } else {
            rankIcon = `#${rank}`;
        }
        
        html += `
            <div class="leaderboard-item">
                <div class="leaderboard-rank ${rankClass}">${rankIcon}</div>
                <div class="leaderboard-info">
                    <div class="leaderboard-score">${entry.score} 分</div>
                    <div class="leaderboard-difficulty">${getDifficultyIcon(entry.difficultySpeed)} ${entry.difficulty}</div>
                </div>
                <div class="leaderboard-date">
                    ${entry.date}<br>
                    ${entry.time}
                </div>
            </div>
        `;
    });
    
    leaderboardList.innerHTML = html;
}

// 获取难度图标
function getDifficultyIcon(speed) {
    switch(speed) {
        case 150: return '🟢';
        case 120: return '🟡';
        case 100: return '🔴';
        case 70: return '💀';
        default: return '⚪';
    }
}

// 清空英雄榜
function clearLeaderboard() {
    console.log('开始清空英雄榜...');
    
    // 清空数组
    leaderboard = [];
    
    // 从localStorage中移除
    try {
        localStorage.removeItem('snakeGameLeaderboard');
        console.log('localStorage已清空');
    } catch (error) {
        console.error('清空localStorage失败:', error);
    }
    
    // 重新显示英雄榜
    displayLeaderboard();
    
    console.log('英雄榜清空完成，当前记录数:', leaderboard.length);
}

// 确保DOM完全加载后再初始化
function initializeGame() {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        // DOM已经加载完成，延迟一点时间确保所有元素都可用
        setTimeout(init, 50);
    }
}

// 测试函数 - 可以在控制台调用
window.testClearLeaderboard = function() {
    console.log('测试清空功能...');
    console.log('清空前记录数:', leaderboard.length);
    console.log('清空前localStorage:', localStorage.getItem('snakeGameLeaderboard'));
    
    clearLeaderboard();
    
    console.log('清空后记录数:', leaderboard.length);
    console.log('清空后localStorage:', localStorage.getItem('snakeGameLeaderboard'));
};

// 启动初始化
initializeGame();