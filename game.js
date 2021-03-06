function start() {
    const board = document.getElementById("game");
    const scoreBoard = document.getElementById("score");
    const deltaBoard = document.getElementById("delta");
    const gameSeed = document.getElementById("game-seed");
    const gameForm = document.getElementById("game-form");
    const betterThanField = document.getElementById("better-than");
    const progressField = document.getElementById("progress");
    const colours = Colours();
    const state = State();

    let game;
    let robotResults = [];

    document.addEventListener("dragstart", pickup);
    document.addEventListener("drop", drop);
    document.addEventListener("dragenter", e => e.preventDefault());
    document.addEventListener("dragover", preview);

    gameForm.addEventListener("submit",reset);

    gameSeed.value = !!window.location.hash ? window.location.hash.substring(1) : "";

    function reset(e) {
        const seed = gameSeed.value;
        window.location.hash = seed;
        game = state.create(seed);
        const robot = new Worker("robots.js");
        robot.onmessage = function(e) {
            robotResults.push(e.data);
            robotResults.sort((a,b) => b.score - a.score);
            draw();
        };
        robot.postMessage(game.squares());
        draw();
        e.preventDefault();
    }

    function achievement() {
        const score = game.evaluate();
        let betterThan = -1;
        robotResults.forEach((x,i) => {
            if (score <= x.score) {
                betterThan = i;
            }
        });
        return {
            player : betterThan+1,
            robots : robotResults.length,
            robotName : betterThan != -1 ? robotResults[betterThan].name : null
        };
    }

    function draw() {
        while (board.firstChild) {
            board.removeChild(board.firstChild);
        }
        game.squares().forEach((x,i) => board.appendChild(createSquareElement(i,x)));
        scoreBoard.innerText = game.evaluate().toFixed(4);
        const ach = achievement();
        if (ach.player == 0) {
            betterThanField.innerHTML = "Keep playing, you can do better!"
        } else if (ach.player < ach.robots) {
            betterThanField.innerHTML = "You're better than <code>"+ach.robotName+"</code>!";
        } else {
            betterThanField.innerHTML = "You've beaten all the robots!";
        }
        let progressPercent =  ach.robots == 0 ? 0 : ach.player * 100 / ach.robots;
        progressField.style["width"] = progressPercent+"%";
    }

    function createSquareElement(idx, square) {
        const ret = document.createElement("div");
        ret.setAttribute("_gameIndex", idx);
        ret.setAttribute("draggable", true);
        ret.style = 'background-color: '+colours.toRGB(square);
        return ret;
    }

    let source;

    function pickup(event) {
        event.dataTransfer.setData("nothing", "nothing"); //required by FF
        source = event.target.getAttribute("_gameIndex");
    }

    function drop(event) {
        const target = event.target.getAttribute("_gameIndex");
        if (!!target) {
            game = game.swap(source,target);
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
            const potentialGame = game.swap(source,target);
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