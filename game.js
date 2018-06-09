function start() {
    const size = 6;
    const saturation = 0.7;
    const min_brightness = 1;
    const board = document.getElementById("game");
    const scoreBoard = document.getElementById("score");

    var squares = [];
    var score = -1;

    document.addEventListener("dragstart", pickup);
    document.addEventListener("drop", drop);
    document.addEventListener("dragenter", e => e.preventDefault());
    document.addEventListener("dragover", e => e.preventDefault());
    reset();

    function generateOne() {
        const hue = Math.random();
        const brightness = min_brightness + (1-min_brightness)*Math.random();
        return {
            hue : hue,
            brightness : brightness
        }
    }

    function diff(a,b) {
        const hue_diff = calc_hue_diff(a.hue, b.hue);
        const brightness_diff = (a.brightness - b.brightness) * (a.brightness - b.brightness);
        return hue_diff + brightness_diff;
    }

    function calc_hue_diff(h1,h2) {
        if (h1 > h2) {
            const swap = h1;
            h1 = h2;
            h2 = swap;
        }
        const diff = Math.min(h2-h1, h1-h2+1);
        return diff * diff;
    }

    function evaluate() {
        let sum = 0;
        for (let i = 0; i < size; i++) {
            for (let j = 0; j < size; j++) {
                if (i > 0) {
                    sum += diff(squares[i*size + j], squares[(i-1)*size + j]);
                }
                if (i < size - 1) {
                    sum += diff(squares[i*size + j], squares[(i+1)*size + j]);
                }
                if (j > 0) {
                    sum += diff(squares[i*size + j], squares[i*size + j - 1]);
                }
                if (j < size - 1) {
                    sum += diff(squares[i*size + j], squares[i*size + j + 1]);
                }
            }
        }
        score = sum;
    }

    function draw() {
        while (board.firstChild) {
            board.removeChild(board.firstChild);
        }
        squares.forEach((x,i) => board.appendChild(createSquareElement(i,x)));
        scoreBoard.innerText = score;
    }

    function reset() {
        for (let i = 0; i < size * size; i++) {
            squares[i] = generateOne();
        }
        evaluate();
        draw();
    }

    function createSquareElement(idx, square) {
        const ret = document.createElement("div");
        ret.setAttribute("_gameIndex", idx);
        ret.setAttribute("draggable", true);
        ret.style = 'background-color: '+toRGB(square);
        return ret;
    }

    function toRGB(square) {
        const color = HSVtoRGB(square.hue, saturation, square.brightness);
        return "#"+toHex(color.r)+toHex(color.g)+toHex(color.b);
    }

    function toHex(num) {
        const s = num.toString(16);
        if (s.length == 1) {
            s = "0"+s;
        }
        return s;
    }

    function HSVtoRGB(h, s, v) {
        var r, g, b, i, f, p, q, t;
        if (arguments.length === 1) {
            s = h.s, v = h.v, h = h.h;
        }
        i = Math.floor(h * 6);
        f = h * 6 - i;
        p = v * (1 - s);
        q = v * (1 - f * s);
        t = v * (1 - (1 - f) * s);
        switch (i % 6) {
            case 0: r = v, g = t, b = p; break;
            case 1: r = q, g = v, b = p; break;
            case 2: r = p, g = v, b = t; break;
            case 3: r = p, g = q, b = v; break;
            case 4: r = t, g = p, b = v; break;
            case 5: r = v, g = p, b = q; break;
        }
        return {
            r: Math.round(r * 255),
            g: Math.round(g * 255),
            b: Math.round(b * 255)
        };
    }

    function pickup(event) {
        console.log(event.target.getAttribute("_gameIndex"));
        event.dataTransfer.setData("idx", event.target.getAttribute("_gameIndex"));
    }

    function release(event) {
        dragged = null;
    }

    function drop(event) {
        const target = event.target.getAttribute("_gameIndex");
        const source = event.dataTransfer.getData("idx");
        const swap = squares[target];
        squares[target] = squares[source];
        squares[source] = swap;
        evaluate();
        draw();
    }


}