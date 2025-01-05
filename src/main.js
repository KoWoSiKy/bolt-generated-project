import { Tetris } from './tetris.js';

    const canvas = document.getElementById('tetris');
    const nextPieceCanvas = document.getElementById('next-piece');
    const scoreDisplay = document.getElementById('score');
    const levelDisplay = document.getElementById('level');
    const startPauseButton = document.getElementById('start-pause-button');
    const gameOverOverlay = document.getElementById('game-over-overlay');
    const restartButton = document.getElementById('restart-button');

    const game = new Tetris(canvas, nextPieceCanvas, scoreDisplay, levelDisplay);
    window.game = game; // Make game accessible globally for button clicks

    let gameStarted = false;

    startPauseButton.addEventListener('click', () => {
      if (!gameStarted) {
        game.start();
        startPauseButton.textContent = '暂停';
        gameStarted = true;
      } else {
        game.togglePause();
        startPauseButton.textContent = game.isPaused ? '继续' : '暂停';
        if (!game.isPaused) {
          game.update();
        }
      }
    });

    restartButton.addEventListener('click', () => {
      game.reset();
      gameOverOverlay.style.display = 'none';
      startPauseButton.textContent = '暂停';
      gameStarted = true;
      game.start();
    });

    document.addEventListener('keydown', (event) => {
      if (game.isPaused || !gameStarted) return;
      switch (event.key) {
        case 'ArrowLeft':
          game.moveLeft();
          break;
        case 'ArrowRight':
          game.moveRight();
          break;
        case 'ArrowUp':
          game.rotate();
          break;
        case 'ArrowDown':
          game.drop();
          break;
      }
    });

    game.onGameOver = () => {
      gameOverOverlay.style.display = 'flex';
      startPauseButton.textContent = '开始';
      gameStarted = false;
    };
