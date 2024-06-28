//FACTORY FUNCTIONS
const createPlayer = function (name, marker, color) {
  return {
    name,
    marker,
    color,
    turn: false,
    score: 0,
    toggleTurn() {
      this.turn = !this.turn;
    },
    addScore() {
      this.score++;
    },
  };
};

//MODULES
//Módulo que se encarga de gestionar la lógica relacionada con el tablero de juego
const gameBoard = (function () {
  let board = Array(9).fill("");

  function getBoard() {
    return [...board];
  }

  function placeMarker(position, marker) {
    if (board[position]) return false;
    board[position] = marker;
    return true;
  }

  function resetBoard() {
    board = Array(9).fill("");
  }

  return { getBoard, placeMarker, resetBoard };
})();

//Módulo que se encarga de manejar los jugadores y la lógica del juego
const gameController = (function () {
  let playersList = [];

  function addPlayer(name, marker, color) {
    const player = createPlayer(name, marker, color);
    playersList.push(player);
  }

  function getPlayers() {
    return [...playersList];
  }

  function resetPlayerList(){
    playersList = [];
  }

  function changePlayerTurn() {
    playersList.forEach((player) => player.toggleTurn());
  }

  function resetTurns(){
    playersList.forEach((player) => player.turn = false);
  }

  function getActivePlayer() {
    return playersList.find((player) => player.turn);
  }

  function getInactivePlayer() {
    return playersList.find((player) => !player.turn);
  }

  function checkWin(marker) {
    const winOptions = [
      [0, 1, 2],
      [3, 4, 5],
      [6, 7, 8], //Rows
      [0, 3, 6],
      [1, 4, 7],
      [2, 5, 8], //Columns
      [0, 4, 8],
      [2, 4, 6], //Diagonals
    ];

    const board = gameBoard.getBoard();
    for (let i = 0; i < winOptions.length; i++) {
      let counter = 0;
      for (let j = 0; j < 3; j++) {
        let position = winOptions[i][j];
        console.log(position);
        if (board[position] === marker) {
          counter++;
        }
      }
      if (counter === 3) {
        console.log("ganó " + marker);
        return true;
      }
    }
    return false;
  }

  function checkDraw() {
    return gameBoard.getBoard().every((cell) => cell !== "");
  }

  return {
    addPlayer,
    getPlayers,
    resetPlayerList,
    changePlayerTurn,
    resetTurns,
    getActivePlayer,
    getInactivePlayer,
    checkWin,
    checkDraw,
  };
})();

//Módulo que se encarga de la comunicación con el DOM
const DOMController = (function () {
  const playerSelectionDiv = document.querySelector(".player-selection");
  const startButton = document.getElementById("start-button");
  const board = document.querySelector(".board");
  const modal = document.querySelector(".modal");
  const playAgainButton = document.getElementById("play-again");
  const exitButton = document.getElementById("new-game");
  const playerOne = document.getElementById("player-one");
  const playerTwo = document.getElementById("player-two");

  startButton.addEventListener("click", startGame);

  board.addEventListener("click", setMarkerOnBoard);

  playAgainButton.addEventListener("click", playAgain);

  exitButton.addEventListener("click", exit);

  function startGame() {
    //Obtenemos el valor de player 1
    const playerOneName = playerOne.value;
    //Obtenemos el valor de player 2
    const playerTwoName = playerTwo.value;
    //Comprobamos que se hayan introducido los 2 nombres
    if (!playerOneName || !playerTwoName)
      return alert("Por favor, introduce los nombres de ambos jugadores.");
    //Llamamos al módulo de players para que allí se creen los 2 players y se añadan al array players
    gameController.addPlayer(playerOneName, "X", "#fff455");
    gameController.addPlayer(playerTwoName, "O", "#EE4E4E");
    gameController.getPlayers()[0].toggleTurn();
    turnMessage(true, gameController.getPlayers()[0]);

    playerSelectionDiv.classList.add("hide");
    board.classList.remove("hide");
  }

  function setMarkerOnBoard(event) {
    if (gameController.getPlayers().length === 0) return;

    const position = event.target.getAttribute("dataCell");
    const activePlayer = gameController.getActivePlayer();
    const inactivePlayer = gameController.getInactivePlayer();
    turnMessage(true, inactivePlayer);
    if (!gameBoard.placeMarker(position, activePlayer.marker)) return;

    event.target.textContent = activePlayer.marker;

    event.target.style.color = activePlayer.color;

    if (gameController.checkWin(activePlayer.marker)) {
      //Lógica de la victoria
      activePlayer.addScore();
      endGame();
      resultMessage(
        `${
          activePlayer.name.charAt(0).toUpperCase() + activePlayer.name.slice(1)
        } wins!`
      );
    }
    if (gameController.checkDraw()) {
      //Lógica del empate
      endGame();
      resultMessage("Draw!");
    }
    gameController.changePlayerTurn();

    console.log(event.target.getAttribute("dataCell"));
    console.log(gameController.getPlayers());
    console.log(gameBoard.getBoard());
  }

  function playAgain(){
    resetBoard();
    modal.close();
    gameController.resetTurns();
    gameController.getPlayers()[0].toggleTurn();
    turnMessage(true, gameController.getPlayers()[0]);
  }

  function exit(){
    modal.close();
    board.classList.add("hide");
    playerSelectionDiv.classList.remove("hide");
    playerOne.value = "";
    playerTwo.value = "";
    resetBoard();
    gameController.resetPlayerList();
  }

  function endGame() {
    board.removeEventListener("click", setMarkerOnBoard);
    modal.showModal();
    turnMessage(false);
    scoresMessage();
  }

  function resetBoard(){
    gameBoard.resetBoard();
    Array.from(board.children).forEach(cell => cell.textContent = "");
    board.addEventListener("click", setMarkerOnBoard);
  }

  function turnMessage(flag, player) {
    const messageDisplay = document.querySelector(".turn-message");
    if (flag) {
      const playerName =
        player.name.charAt(0).toUpperCase() + player.name.slice(1);
      messageDisplay.textContent = `${playerName}, It's your turn!`;
    } else {
      messageDisplay.textContent = "";
    }
  }

  function resultMessage(message) {
    const resultDisplay = document.querySelector(".result-display");
    resultDisplay.textContent = message;
  }

  function scoresMessage() {
    const scoresDisplay = document.querySelector(".scores-display");
    const playerOne = gameController.getPlayers()[0];
    const playerTwo = gameController.getPlayers()[1];

    scoresDisplay.textContent = `${playerOne.name.charAt(0).toUpperCase() + playerOne.name.slice(1)} ${playerOne.score} - ${playerTwo.score} ${playerTwo.name.charAt(0).toUpperCase() + playerTwo.name.slice(1)}`;
  }
})();
