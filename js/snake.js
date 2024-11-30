class SnakeGame {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.gridSize = 20;
        this.snake = [];
        this.food = null;
        this.direction = 'right';
        this.nextDirection = 'right';
        this.score = 0;
        this.highScore = localStorage.getItem('snakeHighScore') || 0;
        this.speed = 1;
        this.gameLoop = null;
        this.isPaused = false;
        this.isGameOver = false;
        
        this.setupGame();
        this.setupEventListeners();
    }

    setupGame() {
        // 初始化蛇的位置
        const startX = Math.floor(this.canvas.width / (2 * this.gridSize)) * this.gridSize;
        const startY = Math.floor(this.canvas.height / (2 * this.gridSize)) * this.gridSize;
        this.snake = [
            { x: startX, y: startY },
            { x: startX - this.gridSize, y: startY },
            { x: startX - this.gridSize * 2, y: startY }
        ];
        
        this.generateFood();
        this.updateScore(0);
        this.updateHighScore();
        this.updateSpeedDisplay();
    }

    setupEventListeners() {
        document.addEventListener('keydown', this.handleKeyPress.bind(this));
        
        document.getElementById('start-btn').addEventListener('click', () => this.startGame());
        document.getElementById('pause-btn').addEventListener('click', () => this.togglePause());
        document.getElementById('restart-btn').addEventListener('click', () => this.restartGame());
        document.getElementById('speed-up').addEventListener('click', () => this.changeSpeed(0.2));
        document.getElementById('speed-down').addEventListener('click', () => this.changeSpeed(-0.2));
    }

    startGame() {
        if (this.gameLoop) return;
        this.isGameOver = false;
        this.setupGame();
        this.gameLoop = setInterval(() => this.gameStep(), 1000 / (5 * this.speed));
    }

    togglePause() {
        if (this.isGameOver) return;
        
        if (this.isPaused) {
            this.gameLoop = setInterval(() => this.gameStep(), 1000 / (5 * this.speed));
        } else {
            clearInterval(this.gameLoop);
            this.gameLoop = null;
        }
        this.isPaused = !this.isPaused;
    }

    restartGame() {
        clearInterval(this.gameLoop);
        this.gameLoop = null;
        this.isPaused = false;
        this.isGameOver = false;
        this.speed = 1;
        this.updateSpeedDisplay();
        this.setupGame();
        this.startGame();
    }

    changeSpeed(delta) {
        this.speed = Math.max(0.5, Math.min(3, this.speed + delta));
        this.updateSpeedDisplay();
        
        if (this.gameLoop) {
            clearInterval(this.gameLoop);
            this.gameLoop = setInterval(() => this.gameStep(), 1000 / (5 * this.speed));
        }
    }

    handleKeyPress(event) {
        const key = event.key.toLowerCase();
        
        // 空格键暂停/继续
        if (key === ' ') {
            this.togglePause();
            return;
        }
        
        // 方向控制
        const directions = {
            arrowup: 'up', w: 'up',
            arrowdown: 'down', s: 'down',
            arrowleft: 'left', a: 'left',
            arrowright: 'right', d: 'right'
        };
        
        if (directions[key]) {
            const newDirection = directions[key];
            const opposites = { up: 'down', down: 'up', left: 'right', right: 'left' };
            
            if (opposites[this.direction] !== newDirection) {
                this.nextDirection = newDirection;
            }
        }
    }

    generateFood() {
        let newFood;
        do {
            newFood = {
                x: Math.floor(Math.random() * (this.canvas.width / this.gridSize)) * this.gridSize,
                y: Math.floor(Math.random() * (this.canvas.height / this.gridSize)) * this.gridSize
            };
        } while (this.snake.some(segment => segment.x === newFood.x && segment.y === newFood.y));
        
        this.food = newFood;
        this.addFoodEffect(newFood.x + this.gridSize/2, newFood.y + this.gridSize/2);
    }

    addFoodEffect(x, y) {
        const effect = document.createElement('div');
        effect.className = 'effect-circle';
        effect.style.left = `${x}px`;
        effect.style.top = `${y}px`;
        document.querySelector('.game-effects').appendChild(effect);
        
        setTimeout(() => effect.remove(), 2000);
    }

    gameStep() {
        if (this.isPaused || this.isGameOver) return;
        
        this.direction = this.nextDirection;
        const head = { ...this.snake[0] };
        
        // 移动蛇头
        switch (this.direction) {
            case 'up': head.y -= this.gridSize; break;
            case 'down': head.y += this.gridSize; break;
            case 'left': head.x -= this.gridSize; break;
            case 'right': head.x += this.gridSize; break;
        }
        
        // 检查碰撞
        if (this.checkCollision(head)) {
            this.handleGameOver();
            return;
        }
        
        this.snake.unshift(head);
        
        // 检查是否吃到食物
        if (head.x === this.food.x && head.y === this.food.y) {
            this.updateScore(this.score + 10);
            this.generateFood();
        } else {
            this.snake.pop();
        }
        
        this.draw();
    }

    checkCollision(head) {
        // 检查墙壁碰撞
        if (head.x < 0 || head.x >= this.canvas.width ||
            head.y < 0 || head.y >= this.canvas.height) {
            return true;
        }
        
        // 检查自身碰撞
        return this.snake.some(segment => segment.x === head.x && segment.y === head.y);
    }

    handleGameOver() {
        this.isGameOver = true;
        clearInterval(this.gameLoop);
        this.gameLoop = null;
        
        // 添加游戏结束动画
        document.querySelector('.game-board-container').classList.add('game-over');
        setTimeout(() => {
            document.querySelector('.game-board-container').classList.remove('game-over');
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            
            this.ctx.fillStyle = '#ff6b6b';
            this.ctx.font = '30px Poppins';
            this.ctx.textAlign = 'center';
            this.ctx.fillText('游戏结束!', this.canvas.width/2, this.canvas.height/2 - 30);
            
            this.ctx.fillStyle = '#fff';
            this.ctx.font = '20px Poppins';
            this.ctx.fillText(`最终得分: ${this.score}`, this.canvas.width/2, this.canvas.height/2 + 10);
            this.ctx.fillText('按空格键重新开始', this.canvas.width/2, this.canvas.height/2 + 40);
        }, 500);
    }

    updateScore(newScore) {
        this.score = newScore;
        document.getElementById('score').textContent = this.score;
        
        if (this.score > this.highScore) {
            this.highScore = this.score;
            localStorage.setItem('snakeHighScore', this.highScore);
            this.updateHighScore();
        }
    }

    updateHighScore() {
        document.getElementById('high-score').textContent = this.highScore;
    }

    updateSpeedDisplay() {
        document.getElementById('speed').textContent = this.speed.toFixed(1);
    }

    draw() {
        // 清空画布
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // 绘制网格
        this.ctx.strokeStyle = 'rgba(78, 205, 196, 0.1)';
        this.ctx.lineWidth = 0.5;
        for (let i = 0; i < this.canvas.width; i += this.gridSize) {
            this.ctx.beginPath();
            this.ctx.moveTo(i, 0);
            this.ctx.lineTo(i, this.canvas.height);
            this.ctx.stroke();
        }
        for (let i = 0; i < this.canvas.height; i += this.gridSize) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, i);
            this.ctx.lineTo(this.canvas.width, i);
            this.ctx.stroke();
        }
        
        // 绘制食物
        const gradient = this.ctx.createRadialGradient(
            this.food.x + this.gridSize/2, this.food.y + this.gridSize/2, 0,
            this.food.x + this.gridSize/2, this.food.y + this.gridSize/2, this.gridSize
        );
        gradient.addColorStop(0, '#ff6b6b');
        gradient.addColorStop(1, '#ff4757');
        this.ctx.fillStyle = gradient;
        this.ctx.beginPath();
        this.ctx.arc(
            this.food.x + this.gridSize/2,
            this.food.y + this.gridSize/2,
            this.gridSize/2,
            0,
            Math.PI * 2
        );
        this.ctx.fill();
        
        // 绘制蛇
        this.snake.forEach((segment, index) => {
            const gradient = this.ctx.createLinearGradient(
                segment.x, segment.y,
                segment.x + this.gridSize, segment.y + this.gridSize
            );
            
            if (index === 0) { // 蛇头
                gradient.addColorStop(0, '#4ecdc4');
                gradient.addColorStop(1, '#45b7af');
            } else { // 蛇身
                gradient.addColorStop(0, '#45b7af');
                gradient.addColorStop(1, '#3ca49d');
            }
            
            this.ctx.fillStyle = gradient;
            this.ctx.fillRect(segment.x, segment.y, this.gridSize, this.gridSize);
            
            // 添加光晕效果
            this.ctx.shadowColor = '#4ecdc4';
            this.ctx.shadowBlur = 10;
            this.ctx.fillRect(segment.x, segment.y, this.gridSize, this.gridSize);
            this.ctx.shadowBlur = 0;
        });
    }
}

// 当页面加载完成时初始化游戏
document.addEventListener('DOMContentLoaded', () => {
    new SnakeGame();
});
