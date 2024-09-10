document.addEventListener('DOMContentLoaded', () => {
    const loadingScreen = document.getElementById('loading-screen');
    const gameContent = document.getElementById('game-content');

    // Simulate loading time
    setTimeout(() => {
        loadingScreen.style.display = 'none';  // Hide loading screen
        gameContent.classList.remove('hidden');  // Show game content
    }, 2000);

    // Game elements
    const board = document.querySelector('#board');
    const cells = document.querySelectorAll('.cell');
    const newGameButton = document.querySelector('#new-game');
    const player1ScoreElement = document.querySelector('#player1-score');
    const player2ScoreElement = document.querySelector('#player2-score');
    const aiScoreElement = document.querySelector('#ai-score');
    const gameModeSelect = document.querySelector('#game-mode-select');
    const player2ScoreLabel = document.getElementById('player2-score-label');
    const aiScoreLabel = document.getElementById('ai-score-label');

    // Game state
    let boardState = Array(9).fill(null);
    let playerTurn = true;  // true = X's turn (Player 1), false = O's turn (Player 2 or AI)
    let player1Score = 0;
    let player2Score = 0;
    let aiScore = 0;
    let isSinglePlayer = true;

    const WINNING_COMBINATIONS = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8], [0, 3, 6],
        [1, 4, 7], [2, 5, 8], [0, 4, 8], [2, 4, 6],
    ];

    // Handle mode switch
    gameModeSelect.addEventListener('change', (event) => {
        const selectedMode = event.target.value;
        isSinglePlayer = selectedMode === 'single';
        if (isSinglePlayer) {
            player2ScoreLabel.classList.add('hidden');
            aiScoreLabel.classList.remove('hidden');
        } else {
            player2ScoreLabel.classList.remove('hidden');
            aiScoreLabel.classList.add('hidden');
        }
        resetBoard();
    });

    // Handle cell clicks
    function handleClick(event) {
        const index = event.target.getAttribute('data-index');
        if (boardState[index]) return;  // Do nothing if the cell is already filled

        if (isSinglePlayer) {
            if (!playerTurn) return;  // Prevent user input during AI's turn

            // Player's move (X)
            boardState[index] = 'X';
            event.target.textContent = 'X';
            playerTurn = false;

            // Check if player won
            if (checkWinner(boardState, 'X')) {
                player1Score++;
                updateScores();
                resetBoard();
                return;
            } else if (isBoardFull(boardState)) {
                resetBoard();
                return;
            }

            // AI's move
            setTimeout(() => {
                aiMove();
                if (checkWinner(boardState, 'O')) {
                    aiScore++;
                    updateScores();
                    resetBoard();
                } else if (isBoardFull(boardState)) {
                    resetBoard();
                }
                playerTurn = true;  // Player's turn again
            }, 500);

        } else {
            // Two-player mode
            if (playerTurn) {
                // Player 1's turn (X)
                boardState[index] = 'X';
                event.target.textContent = 'X';
            } else {
                // Player 2's turn (O)
                boardState[index] = 'O';
                event.target.textContent = 'O';
            }

            // Check if the current player won
            if (checkWinner(boardState, playerTurn ? 'X' : 'O')) {
                if (playerTurn) {
                    player1Score++;
                } else {
                    player2Score++;
                }
                updateScores();
                resetBoard();
            } else if (isBoardFull(boardState)) {
                resetBoard();
            }

            // Switch turns between players
            playerTurn = !playerTurn;
        }
    }

    // AI move (using minimax)
    function aiMove() {
        const bestMove = minimax(boardState, 'O').index;
        boardState[bestMove] = 'O';
        cells[bestMove].textContent = 'O';
    }

    // Minimax algorithm for AI
    function minimax(newBoard, player) {
        const availSpots = newBoard.filter(s => s === null);

        if (checkWinner(newBoard, 'X')) {
            return { score: -10 };
        } else if (checkWinner(newBoard, 'O')) {
            return { score: 10 };
        } else if (availSpots.length === 0) {
            return { score: 0 };
        }

        const moves = [];
        availSpots.forEach((spot) => {
            const move = {};
            move.index = newBoard.indexOf(spot);
            newBoard[move.index] = player;

            move.score = player === 'O'
                ? minimax(newBoard, 'X').score
                : minimax(newBoard, 'O').score;

            newBoard[move.index] = null;
            moves.push(move);
        });

        let bestMove;
        if (player === 'O') {
            bestMove = moves.reduce((best, move) => move.score > best.score ? move : best);
        } else {
            bestMove = moves.reduce((best, move) => move.score < best.score ? move : best);
        }

        return bestMove;
    }

    // Check winner
    function checkWinner(board, player) {
        return WINNING_COMBINATIONS.some(combination =>
            combination.every(index => board[index] === player)
        );
    }

    // Check if the board is full
    function isBoardFull(board) {
        return board.every(cell => cell !== null);
    }

    // Update scores
    function updateScores() {
        player1ScoreElement.textContent = player1Score;
        aiScoreElement.textContent = aiScore;
        player2ScoreElement.textContent = player2Score;
    }

    // Reset the board without resetting scores
    function resetBoard() {
        boardState.fill(null);
        cells.forEach(cell => cell.textContent = '');
        playerTurn = true;  // Reset to Player 1's turn
    }

    // Start a new game (reset the board only)
    newGameButton.addEventListener('click', resetBoard);

    // Set up event listeners for the cells
    cells.forEach(cell => cell.addEventListener('click', handleClick));
});
