function start() {
    const board = document.getElementById("game");
    const scoreBoard = document.getElementById("score");
    const deltaBoard = document.getElementById("delta");
    const gameSeed = document.getElementById("game-seed");
    const gameForm = document.getElementById("game-form");
    const betterThanField = document.getElementById("better-than");
    const colours = Colours();
    const state = State(6);
    const autoplayer = Autoplayer();

    let game;
    let robotResolts;

    document.addEventListener("dragstart", pickup);
    document.addEventListener("drop", drop);
    document.addEventListener("dragenter", e => e.preventDefault());
    document.addEventListener("dragover", preview);

    gameForm.addEventListener("submit",reset);
//    autoplayButton.addEventListener("click",autoplay);

    gameSeed.value = !!window.location.hash ? window.location.hash.substring(1) : "";

    function reset(e) {
        const seed = gameSeed.value;
        window.location.hash = seed;
        game = state.create(seed);
        robotResolts = autoplayer.play(game);
        console.log(robotResolts);
        draw();
        e.preventDefault();
    }

    function achievement() {
        const score = game.evaluate();
        let betterThan = null;
        robotResolts.forEach(x => {
            if (score <= x.score) {
                betterThan = x.name;
            }
        });
        return betterThan;
    }

    function draw() {
        while (board.firstChild) {
            board.removeChild(board.firstChild);
        }
        game.squares().forEach((x,i) => board.appendChild(createSquareElement(i,x)));
        scoreBoard.innerText = game.evaluate().toFixed(4);
        const ach = achievement();
        if (ach == null) {
            betterThanField.innerHTML = "Keep playing, you can do better!"
        } else {
            betterThanField.innerHTML = "You're better than <code>"+ach+"</code>!";
        }
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