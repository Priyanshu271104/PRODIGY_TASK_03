let board = ["", "", "", "", "", "", "", "", ""];
let currentPlayer = "X"; // Player starts as X
let gameActive = false;
let playerXName = "Player X";
let playerOName = "Player O";
let gameMode = ""; // Default empty mode
let aiPlayer = "O"; // AI plays as O
let difficulty = "easy"; // Default difficulty

const squares = document.querySelectorAll(".square");
const message = document.getElementById("scoreMessage");
const resetButton = document.getElementById("reset");
const playerVsPlayerBtn = document.getElementById("playerVsPlayerBtn");
const playerVsAiBtn = document.getElementById("playerVsAiBtn");
const nameModal = document.getElementById("nameModal");
const difficultyModal = document.getElementById("difficultyModal");
const startGameButton = document.getElementById("startGame");
const startGameAIButton = document.getElementById("startGameAI");
const playerXNameInput = document.getElementById("playerXName");
const playerONameInput = document.getElementById("playerOName");
const difficultySelector = document.getElementById("difficultySelector");

const winningConditions = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8],
    [0, 3, 6], [1, 4, 7], [2, 5, 8],
    [0, 4, 8], [2, 4, 6]
];

// Show the initial mode selection modal
window.onload = () => {
    showModal('modeSelectionModal');
};

// Show modal function
function showModal(modalId) {
    document.getElementById(modalId).classList.add("show");
}

// Hide modal function
function hideModal(modalId) {
    document.getElementById(modalId).classList.remove("show");
}

// Game Mode: Player vs Player or Player vs AI
playerVsPlayerBtn.addEventListener("click", () => {
    gameMode = "2p"; // Player vs Player mode
    hideModal("modeSelectionModal");
    showModal("nameModal");
});

playerVsAiBtn.addEventListener("click", () => {
    gameMode = "ai"; // Player vs AI mode
    hideModal("modeSelectionModal");
    showModal("difficultyModal");
});

// Show Name Input Modal for Player vs Player
startGameButton.addEventListener("click", () => {
    playerXName = playerXNameInput.value || "Player X";
    playerOName = playerONameInput.value || "Player O";
    startGame();
});

// Show Difficulty Modal for Player vs AI
startGameAIButton.addEventListener("click", () => {
    difficulty = difficultySelector.value;
    aiPlayer = "O"; // Always AI plays as O
    startGame();
});

function startGame() {
    // Hide modals
    hideModal("nameModal");
    hideModal("difficultyModal");

    // Reset the board and start the game
    board = ["", "", "", "", "", "", "", "", ""];
    currentPlayer = "X"; // Player X starts
    gameActive = true;
    document.getElementById("gameContainer").style.display = "block"; // Show game board
    updateBoard();
    message.textContent = `${playerXName}'s turn`; // Show current player's name
}

// Update game board display
function updateBoard() {
    squares.forEach((square, index) => {
        square.textContent = board[index];
        square.classList.remove("X", "O", "winner");
        if (board[index] === "X") {
            square.classList.add("X");
        } else if (board[index] === "O") {
            square.classList.add("O");
        }
    });
}

// Handle player move
squares.forEach((square, index) => {
    square.addEventListener("click", () => {
        if (board[index] !== "" || !gameActive) return;

        // Mark the square
        board[index] = currentPlayer;
        updateBoard();
        checkGameStatus();

        // Switch turns
        currentPlayer = currentPlayer === "X" ? "O" : "X";

        // Check if AI's turn and mode is Player vs AI
        if (gameMode === "ai" && currentPlayer === aiPlayer && gameActive) {
            aiMove();
        }
    });
});

// AI Move (based on difficulty)
function aiMove() {
    let move;
    if (difficulty === "easy") {
        move = getRandomMove();
    } else if (difficulty === "medium") {
        move = getMediumMove();
    } else if (difficulty === "hard") {
        move = getHardMove();
    }

    // Mark the AI move
    board[move] = aiPlayer;
    updateBoard();
    checkGameStatus();

    currentPlayer = "X"; // Player's turn again
}

// Get Random Move for Easy AI
function getRandomMove() {
    let availableMoves = board.map((val, index) => val === "" ? index : -1).filter(val => val !== -1);
    return availableMoves[Math.floor(Math.random() * availableMoves.length)];
}

// Medium AI: Block player's winning move or random
function getMediumMove() {
    let availableMoves = board.map((val, index) => val === "" ? index : -1).filter(val => val !== -1);

    // Try to block player's winning move
    for (let i = 0; i < availableMoves.length; i++) {
        let move = availableMoves[i];
        board[move] = aiPlayer;
        if (checkForWinner(aiPlayer)) {
            return move;
        }
        board[move] = ""; // Undo move
        
        // Block player's winning move
        board[move] = "X";
        if (checkForWinner("X")) {
            return move;
        }
        board[move] = ""; // Undo move
    }

    // If no block needed, choose randomly
    return getRandomMove();
}

// Hard AI: Minimax algorithm
function getHardMove() {
    let bestScore = -Infinity;
    let move;
    for (let i = 0; i < 9; i++) {
        if (board[i] === "") {
            board[i] = aiPlayer;
            let score = minimax(board, 0, false);
            board[i] = "";
            if (score > bestScore) {
                bestScore = score;
                move = i;
            }
        }
    }
    return move;
}

// Minimax algorithm for AI (Hard mode)
function minimax(board, depth, isMaximizing) {
    let scores = { X: -1, O: 1, draw: 0 };

    if (checkForWinner(aiPlayer)) return scores[aiPlayer];
    if (checkForWinner("X")) return scores["X"];
    if (board.every(square => square !== "")) return scores["draw"]; // Draw

    let bestScore = isMaximizing ? -Infinity : Infinity;
    for (let i = 0; i < 9; i++) {
        if (board[i] === "") {
            board[i] = isMaximizing ? aiPlayer : "X";
            let score = minimax(board, depth + 1, !isMaximizing);
            board[i] = "";
            bestScore = isMaximizing ? Math.max(score, bestScore) : Math.min(score, bestScore);
        }
    }
    return bestScore;
}

// Check game status (win, draw)
function checkGameStatus() {
    let winnerFound = false;

    // Check for win
    for (let condition of winningConditions) {
        const [a, b, c] = condition;
        if (board[a] && board[a] === board[b] && board[a] === board[c]) {
            winnerFound = true;
            highlightWinningLine(condition);
            break;
        }
    }

    // Declare winner or check for draw
    if (winnerFound) {
        message.textContent = `${currentPlayer === "X" ? playerXName : playerOName} wins!`;
        gameActive = false;
    } else if (!board.includes("")) {
        message.textContent = "It's a draw!";
        gameActive = false;
    } else {
        message.textContent = `${currentPlayer === "X" ? playerXName : playerOName}'s turn`;
    }
}

// Highlight the winning line
function highlightWinningLine([a, b, c]) {
    squares[a].classList.add("winner");
    squares[b].classList.add("winner");
    squares[c].classList.add("winner");
}

// Reset the game
resetButton.addEventListener("click", () => {
    // Reset game state
    board = ["", "", "", "", "", "", "", "", ""];
    currentPlayer = "X";
    gameActive = true;
    
    // Reset board display
    squares.forEach((square) => {
        square.textContent = "";         // Clear the text
        square.classList.remove("X", "O", "winner"); // Remove X and O classes
    });

    message.textContent = `${playerXName}'s turn`; // Update the message
});
