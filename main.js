import { createBoard, playMove } from "./connect4.js";

function getWebSocketServer() {
    //if (window.location.host === "BlakeBoudouris.github.io") {
    if (window.location.host.includes("github.io")) { 
        // test comment 17493c7f4390fa7f7b0c6a0f118430aefc1255e6
        return "wss://embarrassed-clementia-blakeboudouris-10059ec4.koyeb.app/";
    }
    else if (window.location.host === "localhost:8000") {
        return "ws://localhost:8001/";
    }
    else {
        throw new Error(`Unsupported host: ${window.location.host}`);
    }
}


function initGame(websocket) {
    websocket.addEventListener("open", () => {
        // Send "init" event according to who is connecting.
        const params = new URLSearchParams(window.location.search);
        let event = { type: "init" };
        if (params.has("join")) {
            // Second player joins an existing game.
            event.join = params.get("join");
        }
        else if (params.has("watch")) {
            event.watch = params.get("watch");
        }
        else {
            // First player starts a new game.
        }
        websocket.send(JSON.stringify(event));
    });
}

function showMessage(message) {
    window.setTimeout(() => window.alert(message), 50);
}

// function receiveMoves(board, websocket) {
//     websocket.addEventListener("message", ({ data }) => {
//         const event = JSON.parse(data);
//         switch (event.type) {
//             case "init":
//                 // create links for inviting the second player and spectators
//                 document.querySelector(".join").href = "?join=" + event.join;
//                 document.querySelector(".watch").href = "?watch=" + event.watch;
//                 break;
//             case "play":
//                 // update UI with move.
//                 playMove(board, event.player, event.column, event.row);
//                 break;
//             case "win":
//                 showMessage(`player ${event.player} wins!`);
//                 // No further messages are expected; close WebSocket connection.
//                 websocket.close(1000);
//                 break;
//             case "error":
//                 showMessage(event.message);
//                 break;
//             default:
//                 throw new Error(`Unknown event type: ${event.type}.`);
//         }
//     });
// }

function receiveMoves(board, websocket) {
    websocket.addEventListener("message", ({ data }) => {
        const event = JSON.parse(data);
  
    //   if (event.type === "init") {
    //     const joinLink = document.querySelector(".join");
    //     const watchLink = document.querySelector(".watch");
  
    //     joinLink.href = "?join=" + event.join;
    //     watchLink.href = "?watch=" + event.watch;
  
    //     // Prevent navigation, just handle game logic
    //     joinLink.addEventListener("click", (e) => {
    //       e.preventDefault();
    //       history.pushState({}, "", joinLink.href);
    //       websocket.send(JSON.stringify({ type: "init", join: event.join }));
    //     });
  
    //     watchLink.addEventListener("click", (e) => {
    //       e.preventDefault();
    //       history.pushState({}, "", watchLink.href);
    //       websocket.send(JSON.stringify({ type: "init", watch: event.watch }));
    //     });
    //   }

        if (event.type === "init") {
            const newLink = document.querySelector(".new");
            const joinLink = document.querySelector(".join");
            const watchLink = document.querySelector(".watch");
        
            joinLink.href = "?join=" + event.join;
            watchLink.href = "?watch=" + event.watch;
            newLink.href = "/"; // or just `"#"` to prevent reload
        
            newLink.addEventListener("click", (e) => {
            e.preventDefault();
            history.pushState({}, "", "/");
            websocket.send(JSON.stringify({ type: "init" }));
            });
        
            joinLink.addEventListener("click", (e) => {
            e.preventDefault();
            history.pushState({}, "", joinLink.href);
            websocket.send(JSON.stringify({ type: "init", join: event.join }));
            });
        
            watchLink.addEventListener("click", (e) => {
            e.preventDefault();
            history.pushState({}, "", watchLink.href);
            websocket.send(JSON.stringify({ type: "init", watch: event.watch }));
            });
        }   
  
        if (event.type === "play") {
            playMove(board, event.player, event.column, event.row);
        }

        if (event.type === "win") {
            showMessage(`player ${event.player} wins!`);
            websocket.close(1000);
        }

        if (event.type === "error") {
            showMessage(event.message);
        }
    });
  }

function sendMoves(board, websocket) {
    // don't send moves for a spectator watching a game.
    const params = new URLSearchParams(window.location.search);
    if (params.has("watch")) {
        return;
    }

    // on a column click, send a play event to the server.
    board.addEventListener("click", ({ target }) => {
        const column = target.dataset.column;
        /// Ignore non-column clicks.
        if (column === undefined) {
            return;
        }
        const event = {
            type: "play",
            column: parseInt(column, 10),
        };
        websocket.send(JSON.stringify(event));
    });
}


window.addEventListener("DOMContentLoaded", () => {
    // Initialize the UI.
    const board = document.querySelector(".board");
    createBoard(board);
    // open the websocket connection and register event handlers.
    const websocket = new WebSocket(getWebSocketServer());
    initGame(websocket);
    receiveMoves(board, websocket);
    sendMoves(board, websocket);
  });
