function start() {
    const board = document.getElementById("game");
    const scoreBoard = document.getElementById("score");
    const deltaBoard = document.getElementById("delta");
    const colours = Colours();
    const state = State(6);

    let game = state.create();

    document.addEventListener("dragstart", pickup);
    document.addEventListener("drop", drop);
    document.addEventListener("drag", e => e.preventDefault());
    document.addEventListener("dragenter", e => e.preventDefault());
    document.addEventListener("dragover", preview);
    draw();


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
        source = event.target.getAttribute("_gameIndex");
    }

    function drop(event) {
        const target = event.target.getAttribute("_gameIndex");
        game = game.swap(source,target);
        deltaBoard.innerText = '';
        draw();
    }

    function preview(event) {
        event.preventDefault();
        const target = event.target.getAttribute("_gameIndex");
        if (!target) {
            deltaBoard.innerText = '---';
        } else {
            const potentialGame = game.swap(source,target);
            deltaBoard.innerText = (potentialGame.evaluate() - game.evaluate()).toFixed(4);
        }
    }

}