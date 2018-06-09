function start() {
    const board = document.getElementById("game");
    const scoreBoard = document.getElementById("score");
    const deltaBoard = document.getElementById("delta");
    const gameSeed = document.getElementById("game-seed");
    const gameForm = document.getElementById("game-form");
    const colours = Colours();
    const state = State(6);

    let game;

    document.addEventListener("dragstart", pickup);
    document.addEventListener("drop", drop);
    //document.addEventListener("drag", e => e.preventDefault());
    document.addEventListener("dragenter", e => e.preventDefault());
    document.addEventListener("dragover", preview);

    gameForm.addEventListener("submit",reset);

    gameSeed.value = !!window.location.hash ? window.location.hash.substring(1) : "";

    function reset() {
        const seed = gameSeed.value;
        window.location.hash = seed;
        game = state.create(seed);
        draw();
    }

    function draw() {
        while (board.firstChild) {
            board.removeChild(board.firstChild);
        }
        game.squares().forEach((x,i) => board.appendChild(createSquareElement(i,x)));
        scoreBoard.innerText = game.evaluate().toFixed(4);
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
        deltaBoard.innerText = '';
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