const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const scoreElement = document.getElementById('score'); // <-- 新增：获取分数元素

let score = 0; // <-- 新增：初始化分数变量

console.log('Game script loaded!');
// 游戏逻辑将在这里添加

// <-- 新增：一个更新分数的函数 -->
function updateScore(newScore) {
    score = newScore;
    scoreElement.innerText = `Score: ${score}`;
}

// 示例：每秒钟让分数增加10分，用来测试
setInterval(() => {
    updateScore(score + 10);
}, 1000);