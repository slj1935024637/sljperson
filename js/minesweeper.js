class Minesweeper {
    constructor() {
        this.board = null;
        this.mineLocations = new Set();
        this.flaggedCells = new Set();
        this.revealedCells = new Set();
        this.firstClick = true;
        this.gameOver = false;
        this.timer = null;
        this.timeElapsed = 0;
        
        this.difficulties = {
            beginner: { rows: 9, cols: 9, mines: 10 },
            intermediate: { rows: 16, cols: 16, mines: 40 },
            expert: { rows: 16, cols: 30, mines: 99 }
        };
        
        this.currentDifficulty = 'beginner';
        this.setupEventListeners();
        this.initializeGame();
    }

    setupEventListeners() {
        document.querySelectorAll('.difficulty-selector button').forEach(button => {
            button.addEventListener('click', () => {
                document.querySelectorAll('.difficulty-selector button').forEach(b => b.classList.remove('active'));
                button.classList.add('active');
                this.currentDifficulty = button.dataset.difficulty;
                this.initializeGame();
            });
        });

        document.getElementById('new-game-btn').addEventListener('click', () => {
            this.initializeGame();
        });

        // 初始化时激活"初级"按钮
        document.querySelector('[data-difficulty="beginner"]').classList.add('active');
    }

    initializeGame() {
        this.stopTimer();
        this.timeElapsed = 0;
        document.getElementById('timer').textContent = '0';
        this.firstClick = true;
        this.gameOver = false;
        this.mineLocations.clear();
        this.flaggedCells.clear();
        this.revealedCells.clear();
        
        const { rows, cols, mines } = this.difficulties[this.currentDifficulty];
        document.getElementById('mines-count').textContent = mines;
        
        this.createBoard(rows, cols);
    }

    createBoard(rows, cols) {
        const board = document.getElementById('board');
        board.style.gridTemplateColumns = `repeat(${cols}, 30px)`;
        board.innerHTML = '';
        
        for (let i = 0; i < rows; i++) {
            for (let j = 0; j < cols; j++) {
                const cell = document.createElement('div');
                cell.className = 'cell';
                cell.dataset.row = i;
                cell.dataset.col = j;
                
                cell.addEventListener('click', (e) => this.handleClick(e, i, j));
                cell.addEventListener('contextmenu', (e) => this.handleRightClick(e, i, j));
                cell.addEventListener('dblclick', (e) => this.handleDoubleClick(e, i, j));
                
                board.appendChild(cell);
            }
        }
    }

    placeMines(rows, cols, mines, firstClickRow, firstClickCol) {
        while (this.mineLocations.size < mines) {
            const row = Math.floor(Math.random() * rows);
            const col = Math.floor(Math.random() * cols);
            const key = `${row},${col}`;
            
            // 确保不在首次点击的位置及其周围放置地雷
            if (!this.mineLocations.has(key) && 
                Math.abs(row - firstClickRow) > 1 || 
                Math.abs(col - firstClickCol) > 1) {
                this.mineLocations.add(key);
            }
        }
    }

    startTimer() {
        if (this.timer) return;
        
        this.timer = setInterval(() => {
            this.timeElapsed++;
            document.getElementById('timer').textContent = this.timeElapsed;
        }, 1000);
    }

    stopTimer() {
        if (this.timer) {
            clearInterval(this.timer);
            this.timer = null;
        }
    }

    handleClick(e, row, col) {
        e.preventDefault();
        if (this.gameOver) return;
        
        const { rows, cols, mines } = this.difficulties[this.currentDifficulty];
        
        if (this.firstClick) {
            this.firstClick = false;
            this.placeMines(rows, cols, mines, row, col);
            this.startTimer();
        }
        
        this.revealCell(row, col);
    }

    handleRightClick(e, row, col) {
        e.preventDefault();
        if (this.gameOver || this.firstClick) return;
        
        const key = `${row},${col}`;
        const cell = document.querySelector(`[data-row="${row}"][data-col="${col}"]`);
        
        if (this.revealedCells.has(key)) return;
        
        if (this.flaggedCells.has(key)) {
            this.flaggedCells.delete(key);
            cell.classList.remove('flagged');
            cell.classList.add('question');
        } else if (cell.classList.contains('question')) {
            cell.classList.remove('question');
        } else {
            this.flaggedCells.add(key);
            cell.classList.add('flagged');
        }
        
        const remainingMines = this.difficulties[this.currentDifficulty].mines - this.flaggedCells.size;
        document.getElementById('mines-count').textContent = remainingMines;
    }

    handleDoubleClick(e, row, col) {
        e.preventDefault();
        if (this.gameOver || this.firstClick) return;
        
        const key = `${row},${col}`;
        if (!this.revealedCells.has(key)) return;
        
        const cell = document.querySelector(`[data-row="${row}"][data-col="${col}"]`);
        const number = parseInt(cell.dataset.number);
        if (isNaN(number)) return;
        
        const flaggedNeighbors = this.getNeighbors(row, col)
            .filter(([r, c]) => this.flaggedCells.has(`${r},${c}`))
            .length;
        
        if (flaggedNeighbors === number) {
            this.getNeighbors(row, col).forEach(([r, c]) => {
                if (!this.flaggedCells.has(`${r},${c}`)) {
                    this.revealCell(r, c);
                }
            });
        }
    }

    revealCell(row, col) {
        const key = `${row},${col}`;
        if (this.revealedCells.has(key) || this.flaggedCells.has(key)) return;
        
        const cell = document.querySelector(`[data-row="${row}"][data-col="${col}"]`);
        this.revealedCells.add(key);
        cell.classList.add('revealed');
        
        if (this.mineLocations.has(key)) {
            this.gameOver = true;
            this.revealAllMines();
            cell.classList.add('mine');
            cell.textContent = '💥';
            this.stopTimer();
            setTimeout(() => alert('游戏结束！'), 100);
            return;
        }
        
        const neighborMines = this.countNeighborMines(row, col);
        if (neighborMines > 0) {
            cell.textContent = neighborMines;
            cell.dataset.number = neighborMines;
        } else {
            this.getNeighbors(row, col).forEach(([r, c]) => this.revealCell(r, c));
        }
        
        this.checkWin();
    }

    revealAllMines() {
        this.mineLocations.forEach(key => {
            const [row, col] = key.split(',').map(Number);
            const cell = document.querySelector(`[data-row="${row}"][data-col="${col}"]`);
            if (!cell.classList.contains('revealed')) {
                cell.classList.add('revealed', 'mine');
                cell.textContent = '💣';
            }
        });
    }

    getNeighbors(row, col) {
        const { rows, cols } = this.difficulties[this.currentDifficulty];
        const neighbors = [];
        
        for (let i = -1; i <= 1; i++) {
            for (let j = -1; j <= 1; j++) {
                if (i === 0 && j === 0) continue;
                
                const newRow = row + i;
                const newCol = col + j;
                
                if (newRow >= 0 && newRow < rows && newCol >= 0 && newCol < cols) {
                    neighbors.push([newRow, newCol]);
                }
            }
        }
        
        return neighbors;
    }

    countNeighborMines(row, col) {
        return this.getNeighbors(row, col)
            .filter(([r, c]) => this.mineLocations.has(`${r},${c}`))
            .length;
    }

    checkWin() {
        const { rows, cols, mines } = this.difficulties[this.currentDifficulty];
        const totalCells = rows * cols;
        
        if (this.revealedCells.size === totalCells - mines) {
            this.gameOver = true;
            this.stopTimer();
            setTimeout(() => alert('恭喜你赢了！'), 100);
        }
    }
}

// 当页面加载完成时初始化游戏
document.addEventListener('DOMContentLoaded', () => {
    new Minesweeper();
});
