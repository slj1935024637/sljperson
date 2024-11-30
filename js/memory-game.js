class MemoryGame {
    constructor() {
        this.cards = document.querySelectorAll('.memory-card');
        this.moves = 0;
        this.matches = 0;
        this.hasFlippedCard = false;
        this.lockBoard = false;
        this.firstCard = null;
        this.secondCard = null;
        this.timer = 0;
        this.timerInterval = null;
        
        this.init();
    }

    init() {
        this.shuffleCards();
        this.addEventListeners();
        this.resetStats();
        this.startTimer();
    }

    shuffleCards() {
        this.cards.forEach(card => {
            const randomPosition = Math.floor(Math.random() * this.cards.length);
            card.style.order = randomPosition;
        });
    }

    addEventListeners() {
        this.cards.forEach(card => card.addEventListener('click', () => this.flipCard(card)));
        document.getElementById('restart-btn').addEventListener('click', () => this.resetGame());
    }

    flipCard(card) {
        if (this.lockBoard) return;
        if (card === this.firstCard) return;

        card.classList.add('flip');

        if (!this.hasFlippedCard) {
            // 第一次点击
            this.hasFlippedCard = true;
            this.firstCard = card;
            return;
        }

        // 第二次点击
        this.secondCard = card;
        this.moves++;
        document.getElementById('moves').textContent = this.moves;
        this.checkForMatch();
    }

    checkForMatch() {
        const isMatch = this.firstCard.dataset.framework === this.secondCard.dataset.framework;
        isMatch ? this.disableCards() : this.unflipCards();
    }

    disableCards() {
        this.firstCard.removeEventListener('click', this.flipCard);
        this.secondCard.removeEventListener('click', this.flipCard);
        this.matches++;

        if (this.matches === this.cards.length / 2) {
            this.gameWon();
        }

        this.resetBoard();
    }

    unflipCards() {
        this.lockBoard = true;

        setTimeout(() => {
            this.firstCard.classList.remove('flip');
            this.secondCard.classList.remove('flip');
            this.resetBoard();
        }, 1000);
    }

    resetBoard() {
        [this.hasFlippedCard, this.lockBoard] = [false, false];
        [this.firstCard, this.secondCard] = [null, null];
    }

    resetGame() {
        // 重置所有卡片
        this.cards.forEach(card => {
            card.classList.remove('flip');
            setTimeout(() => {
                this.shuffleCards();
            }, 500);
        });

        // 重置状态
        this.matches = 0;
        this.resetBoard();
        this.resetStats();
        this.startTimer();
    }

    resetStats() {
        this.moves = 0;
        document.getElementById('moves').textContent = this.moves;
        this.timer = 0;
        document.getElementById('timer').textContent = this.timer;
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
        }
    }

    startTimer() {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
        }
        this.timer = 0;
        document.getElementById('timer').textContent = this.timer;
        this.timerInterval = setInterval(() => {
            this.timer++;
            document.getElementById('timer').textContent = this.timer;
        }, 1000);
    }

    gameWon() {
        clearInterval(this.timerInterval);
        
        // 创建胜利弹窗
        const modal = document.createElement('div');
        modal.className = 'victory-modal';
        modal.innerHTML = `
            <h2>恭喜你赢了！</h2>
            <p>用时: ${this.timer} 秒</p>
            <p>步数: ${this.moves} 步</p>
            <button id="play-again" class="btn">再玩一次</button>
        `;
        document.body.appendChild(modal);

        // 显示动画
        setTimeout(() => modal.classList.add('show'), 100);

        // 再玩一次按钮
        const playAgainBtn = modal.querySelector('#play-again');
        playAgainBtn.addEventListener('click', () => {
            modal.remove();
            this.resetGame();
        });
    }
}

// 当页面加载完成时初始化游戏
document.addEventListener('DOMContentLoaded', () => {
    new MemoryGame();
});
