function start() {
    const board = document.getElementById("game");
    const scoreBoard = document.getElementById("score");
    const deltaBoard = document.getElementById("delta");
    const gameSeed = document.getElementById("game-seed");
    const gameForm = document.getElementById("game-form");
    const robotBar = document.getElementById("robot-bar");
    const colours = Colours();
    const state = State();

    let dragSource;


    let game;
    let robotResults = {};

    document.addEventListener("dragstart", pickup);
    document.addEventListener("drop", drop);
    document.addEventListener("dragenter", e => e.preventDefault());
    document.addEventListener("dragover", preview);

    gameForm.addEventListener("submit", reset);

    gameSeed.value = !!window.location.hash ? window.location.hash.substring(1) : "";

    function reset(e) {
        const seed = gameSeed.value;
        window.location.hash = seed;
        game = state.create(seed);
        const robot = new Worker("./robots.js");
        robot.onmessage = function (e) {
            robotResults[e.data.name] = e.data.score;
            draw();
        };
        robot.postMessage(game.squares());
        draw();
        e.preventDefault();
    }

    function addTextDiv(parent, text) {
        const child = document.createElement("div");
        child.innerText = text;
        parent.appendChild(child);
        return child;
    }

    function drawRobots(playerScore) {
        robotBar.innerHTML = "";
        Object.keys(robotResults).forEach(r => {
            const robotScore = robotResults[r];
            const res = document.createElement("div");
            if (robotScore && playerScore < robotScore) {
                res.style.color = "#22ff22";
            }
            addTextDiv(res, r);
            addTextDiv(res, "🤖");
            addTextDiv(res, robotResults[r]?.toFixed(4) || "---");
            robotBar.append(res);
        });
    }

    function draw() {
        while (board.firstChild) {
            board.removeChild(board.firstChild);
        }
        game.squares().forEach((x, i) => board.appendChild(createSquareElement(i, x)));
        const score = game.evaluate();
        scoreBoard.innerText = score.toFixed(4);
        drawRobots(score);
    }

    function createSquareElement(idx, square) {
        const ret = document.createElement("div");
        ret.setAttribute("_gameIndex", idx);
        ret.setAttribute("draggable", true);
        ret.style = 'background-color: ' + colours.toRGB(square);
        return ret;
    }


    function pickup(event) {
        event.dataTransfer.setData("nothing", "nothing"); //required by FF
        dragSource = event.target.getAttribute("_gameIndex");
    }

    function drop(event) {
        const target = event.target.getAttribute("_gameIndex");
        if (!!target) {
            game = game.swap(dragSource, target);
        }
        deltaBoard.innerText = '---';
        deltaBoard.style["color"] = "black";
        draw();
    }

    function preview(event) {
        event.preventDefault();
        const target = event.target.getAttribute("_gameIndex");
        if (!target) {
            deltaBoard.innerText = '---';
            deltaBoard.style["color"] = "black";
        } else {
            const potentialGame = game.swap(dragSource, target);
            const delta = (potentialGame.evaluate() - game.evaluate());
            deltaBoard.innerText = delta.toFixed(4);
            if (delta == 0) {
                deltaBoard.style["color"] = "black";
            } else if (delta < 0) {
                deltaBoard.style["color"] = "#22ff22";
            } else {
                deltaBoard.style["color"] = "#ff2222";
            }
        }
    }

}