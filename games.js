document.addEventListener("DOMContentLoaded", () => {
  const gameArea = document.getElementById("gameArea");

  // ===== איקס-עיגול =====
  document.getElementById("ticTacToeBtn").onclick = () => {
    gameArea.innerHTML = "";
    startTicTacToe();
  };

  // ===== נחש מספר =====
  document.getElementById("guessNumberBtn").onclick = () => {
    gameArea.innerHTML = "";
    startGuessNumber();
  };

  // ===== משחק זיכרון =====
  document.getElementById("memoryBtn").onclick = () => {
    gameArea.innerHTML = "";
    startMemoryGame();
  };

  // ===== פונקציות המשחקים =====
  function startTicTacToe() {
    const grid = document.createElement("div");
    grid.className = "ticTacToe-grid";
    let turn = "X";
    let board = Array(9).fill("");

    for (let i = 0; i < 9; i++) {
      const cell = document.createElement("div");
      cell.className = "ticTacToe-cell";
      cell.addEventListener("click", () => {
        if (cell.textContent || checkWinner(board)) return;
        cell.textContent = turn;
        board[i] = turn;
        if (checkWinner(board)) {
          alert(turn + " ניצח!");
        } else {
          turn = turn === "X" ? "O" : "X";
        }
      });
      grid.appendChild(cell);
    }
    gameArea.appendChild(grid);

    function checkWinner(b) {
      const combos = [
        [0,1,2],[3,4,5],[6,7,8],
        [0,3,6],[1,4,7],[2,5,8],
        [0,4,8],[2,4,6]
      ];
      return combos.some(c => c.every(i => b[i] && b[i] === b[c[0]]));
    }
  }

  function startGuessNumber() {
    const number = Math.floor(Math.random() * 100) + 1;
    let attempts = 0;

    const input = document.createElement("input");
    input.type = "number";
    input.placeholder = "נחש מספר 1-100";

    const btn = document.createElement("button");
    btn.textContent = "נחש!";

    const msg = document.createElement("div");

    btn.onclick = () => {
      const guess = parseInt(input.value);
      attempts++;
      if (guess === number) {
        msg.textContent = `ניצחת! מספר נכון: ${number} לאחר ${attempts} ניסיונות`;
      } else if (guess < number) {
        msg.textContent = "נמוך מדי!";
      } else {
        msg.textContent = "גבוה מדי!";
      }
      input.value = "";
    };

    gameArea.append(input, btn, msg);
  }

  function startMemoryGame() {
    const cards = ["🍎","🍌","🍇","🍉","🍎","🍌","🍇","🍉"];
    cards.sort(() => Math.random() - 0.5);
    let first = null;
    let second = null;

    const board = document.createElement("div");
    board.className = "memory-board";

    cards.forEach((emoji, i) => {
      const card = document.createElement("div");
      card.className = "memory-card";
      card.textContent = "?";
      card.addEventListener("click", () => {
        if (card.textContent !== "?") return;
        card.textContent = emoji;
        if (!first) first = card;
        else if (!second) {
          second = card;
          if (first.dataset.emoji === second.dataset.emoji || first.textContent === second.textContent) {
            first = null; second = null;
          } else {
            setTimeout(() => { first.textContent = "?"; second.textContent = "?"; first = null; second = null; }, 1000);
          }
        }
      });
      card.dataset.emoji = emoji;
      board.appendChild(card);
    });

    gameArea.appendChild(board);
  }
});
