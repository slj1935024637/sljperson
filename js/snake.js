class Snake {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.gridSize = 20;
        this.snake = [{x: 10, y: 10}];
        this.direction = 'right';
        this.food = this.generateFood();
        this.score = 0;
        this.gameOver = false;
        this.speed = 150;
        this.gameLoop = null;
    }

    generateFood() {
        const x = Math.floor(Math.random() * (this.canvas.width / this.gridSize));
        const y = Math.floor(Math.random() * (this.canvas.height / this.gridSize));
        return {x, y};
    }

    draw() {
        // 清空画布
        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // 绘制蛇
        this.ctx.fillStyle = '#4ecdc4';
        this.snake.forEach((segment, index) => {
            const gradient = this.ctx.createLinearGradient(
                segment.x * this.gridSize,
                segment.y * this.gridSize,
                (segment.x + 1) * this.gridSize,
                (segment.y + 1) * this.gridSize
            );
            gradient.addColorStop(0, '#4ecdc4');
            gradient.addColorStop(1, '#ff6b6b');
            this.ctx.fillStyle = gradient;
            this.ctx.fillRect(
                segment.x * this.gridSize,
                segment.y * this.gridSize,
                this.gridSize - 2,
                this.gridSize - 2
            );
        });

        // 绘制食物
        this.ctx.fillStyle = '#ff6b6b';
        this.ctx.beginPath();
        this.ctx.arc(
            (this.food.x * this.gridSize) + this.gridSize/2,
            (this.food.y * this.gridSize) + this.gridSize/2,
            this.gridSize/2 - 2,
            0,
            Math.PI * 2
        );
        this.ctx.fill();
    }

    move() {
        if (this.gameOver) return;

        const head = {...this.snake[0]};

        switch(this.direction) {
            case 'up': head.y--; break;
            case 'down': head.y++; break;
            case 'left': head.x--; break;
            case 'right': head.x++; break;
        }

        // 检查碰撞
        if (this.checkCollision(head)) {
            this.gameOver = true;
            return;
        }

        this.snake.unshift(head);

        // 检查是否吃到食物
        if (head.x === this.food.x && head.y === this.food.y) {
            this.score += 10;
            document.getElementById('score').textContent = this.score;
            this.food = this.generateFood();
            // 加快速度
            if (this.speed > 50) {
                this.speed -= 5;
                clearInterval(this.gameLoop);
                this.gameLoop = setInterval(() => this.move(), this.speed);
            }
        } else {
            this.snake.pop();
        }

        this.draw();
    }

    checkCollision(head) {
        // 检查墙壁碰撞
        if (head.x < 0 || head.x >= this.canvas.width / this.gridSize ||
            head.y < 0 || head.y >= this.canvas.height / this.gridSize) {
            return true;
        }

        // 检查自身碰撞
        return this.snake.some(segment => segment.x === head.x && segment.y === head.y);
    }

    start() {
        this.snake = [{x: 10, y: 10}];
        this.direction = 'right';
        this.score = 0;
        this.gameOver = false;
        this.speed = 150;
        document.getElementById('score').textContent = this.score;
        if (this.gameLoop) clearInterval(this.gameLoop);
        this.gameLoop = setInterval(() => this.move(), this.speed);
    }
}

// 游戏初始化
document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('gameCanvas');
    const game = new Snake(canvas);
    
    // 控制按钮
    document.getElementById('startButton').addEventListener('click', () => {
        game.start();
    });

    // 键盘控制
    document.addEventListener('keydown', (e) => {
        const key = e.key.toLowerCase();
        if ((key === 'arrowup' || key === 'w') && game.direction !== 'down') {
            game.direction = 'up';
        } else if ((key === 'arrowdown' || key === 's') && game.direction !== 'up') {
            game.direction = 'down';
        } else if ((key === 'arrowleft' || key === 'a') && game.direction !== 'right') {
            game.direction = 'left';
        } else if ((key === 'arrowright' || key === 'd') && game.direction !== 'left') {
            game.direction = 'right';
        }
    });

    // 初始绘制
    game.draw();
});
