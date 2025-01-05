export class Tetris {
      constructor(canvas, nextPieceCanvas, scoreDisplay, levelDisplay) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.nextPieceCanvas = nextPieceCanvas;
        this.nextPieceCtx = nextPieceCanvas.getContext('2d');
        this.scoreDisplay = scoreDisplay;
        this.levelDisplay = levelDisplay;
        this.grid = this.createGrid();
        this.currentPiece = this.randomPiece();
        this.nextPiece = this.randomPiece();
        this.piecePosition = { x: 0, y: 0 };
        this.score = 0;
        this.level = 1;
        this.dropInterval = 1000;
        this.lastDropTime = 0;
        this.gameOver = false;
        this.isPaused = true;
        this.blockSize = 30;
        this.colors = [
          null,
          'cyan',
          'blue',
          'orange',
          'yellow',
          'green',
          'purple',
          'red',
        ];
        this.onGameOver = null;
      }

      start() {
        if (!this.isPaused) return;
        this.isPaused = false;
        this.update();
      }

      togglePause() {
        this.isPaused = !this.isPaused;
      }

      reset() {
        this.grid = this.createGrid();
        this.currentPiece = this.randomPiece();
        this.nextPiece = this.randomPiece();
        this.piecePosition = { x: 0, y: 0 };
        this.score = 0;
        this.level = 1;
        this.dropInterval = 1000;
        this.lastDropTime = 0;
        this.gameOver = false;
        this.isPaused = true;
        this.scoreDisplay.textContent = this.score;
        this.levelDisplay.textContent = this.level;
      }

      createGrid() {
        const rows = 20;
        const cols = 10;
        return Array(rows).fill(null).map(() => Array(cols).fill(0));
      }

      randomPiece() {
        const pieces = [
          [[1, 1, 1, 1]],
          [[1, 0, 0], [1, 1, 1]],
          [[0, 0, 1], [1, 1, 1]],
          [[1, 1], [1, 1]],
          [[0, 1, 1], [1, 1, 0]],
          [[1, 1, 0], [0, 1, 1]],
          [[0, 1, 0], [1, 1, 1]],
        ];
        return pieces[Math.floor(Math.random() * pieces.length)];
      }

      drawBlock(x, y, color, ctx) {
        ctx.fillStyle = color;
        ctx.fillRect(x * this.blockSize, y * this.blockSize, this.blockSize, this.blockSize);
        ctx.strokeStyle = 'black';
        ctx.strokeRect(x * this.blockSize, y * this.blockSize, this.blockSize, this.blockSize);
      }

      draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.drawGrid();
        this.drawPiece();
        this.drawNextPiece();
      }

      drawGrid() {
        for (let y = 0; y < this.grid.length; y++) {
          for (let x = 0; x < this.grid[y].length; x++) {
            if (this.grid[y][x]) {
              this.drawBlock(x, y, this.colors[this.grid[y][x]], this.ctx);
            }
          }
        }
      }

      drawPiece() {
        const piece = this.currentPiece;
        for (let y = 0; y < piece.length; y++) {
          for (let x = 0; x < piece[y].length; x++) {
            if (piece[y][x]) {
              this.drawBlock(this.piecePosition.x + x, this.piecePosition.y + y, this.colors[piece[y][x]], this.ctx);
            }
          }
        }
      }

      drawNextPiece() {
        this.nextPieceCtx.clearRect(0, 0, this.nextPieceCanvas.width, this.nextPieceCanvas.height);
        const piece = this.nextPiece;
        const offsetX = (this.nextPieceCanvas.width / this.blockSize - piece[0].length) / 2;
        const offsetY = (this.nextPieceCanvas.height / this.blockSize - piece.length) / 2;

        for (let y = 0; y < piece.length; y++) {
          for (let x = 0; x < piece[y].length; x++) {
            if (piece[y][x]) {
              this.drawBlock(offsetX + x, offsetY + y, this.colors[piece[y][x]], this.nextPieceCtx);
            }
          }
        }
      }

      moveLeft() {
        this.piecePosition.x--;
        if (this.checkCollision()) {
          this.piecePosition.x++;
        }
      }

      moveRight() {
        this.piecePosition.x++;
        if (this.checkCollision()) {
          this.piecePosition.x--;
        }
      }

      rotate() {
        const rotatedPiece = this.rotatePiece(this.currentPiece);
        const originalPiece = this.currentPiece;
        this.currentPiece = rotatedPiece;
        if (this.checkCollision()) {
          this.currentPiece = originalPiece;
        }
      }

      rotatePiece(piece) {
        const rows = piece.length;
        const cols = piece[0].length;
        const rotated = Array(cols).fill(null).map(() => Array(rows).fill(0));
        for (let y = 0; y < rows; y++) {
          for (let x = 0; x < cols; x++) {
            rotated[x][rows - 1 - y] = piece[y][x];
          }
        }
        return rotated;
      }

      drop() {
        this.piecePosition.y++;
        if (this.checkCollision()) {
          this.piecePosition.y--;
          this.lockPiece();
          this.clearLines();
          this.currentPiece = this.nextPiece;
          this.nextPiece = this.randomPiece();
          this.piecePosition = { x: 0, y: 0 };
          if (this.checkCollision()) {
            this.gameOver = true;
            if (this.onGameOver) {
              this.onGameOver();
            }
          }
        }
      }

      checkCollision() {
        const piece = this.currentPiece;
        for (let y = 0; y < piece.length; y++) {
          for (let x = 0; x < piece[y].length; x++) {
            if (piece[y][x]) {
              const gridX = this.piecePosition.x + x;
              const gridY = this.piecePosition.y + y;
              if (gridX < 0 || gridX >= this.grid[0].length || gridY >= this.grid.length || (gridY >= 0 && this.grid[gridY][gridX])) {
                return true;
              }
            }
          }
        }
        return false;
      }

      lockPiece() {
        const piece = this.currentPiece;
        for (let y = 0; y < piece.length; y++) {
          for (let x = 0; x < piece[y].length; x++) {
            if (piece[y][x]) {
              this.grid[this.piecePosition.y + y][this.piecePosition.x + x] = piece[y][x];
            }
          }
        }
      }

      clearLines() {
        let linesCleared = 0;
        for (let y = this.grid.length - 1; y >= 0; y--) {
          if (this.grid[y].every(value => value !== 0)) {
            linesCleared++;
            this.grid.splice(y, 1);
            this.grid.unshift(Array(this.grid[0].length).fill(0));
            y++;
          }
        }
        if (linesCleared > 0) {
          this.updateScore(linesCleared);
        }
      }

      updateScore(linesCleared) {
        this.score += linesCleared * 100 * this.level;
        this.scoreDisplay.textContent = this.score;
        if (this.score >= this.level * 1000) {
          this.level++;
          this.levelDisplay.textContent = this.level;
          this.dropInterval = Math.max(100, this.dropInterval - 100);
        }
      }

      update(time = 0) {
        if (this.gameOver || this.isPaused) {
          this.draw();
          return;
        }
        const deltaTime = time - this.lastDropTime;
        if (deltaTime > this.dropInterval) {
          this.drop();
          this.lastDropTime = time;
        }
        this.draw();
        requestAnimationFrame(this.update.bind(this));
      }
    }
