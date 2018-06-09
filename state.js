function State(size) {
    const saturation = 0.7;
    const min_brightness = 1;

    function init(oldSquares) {
        const squares = oldSquares || generateSquares();

        function generateSquare() {
            const hue = Math.random();
            const brightness = min_brightness + (1-min_brightness)*Math.random();
            return {
                hue : hue,
                brightness : brightness,
                saturation : saturation
            }
        }

        function generateSquares() {
            let ret = [];
            for (let i = 0; i < size * size; i++) {
                ret[i] = generateSquare();
            }
            return ret;
        }

        function swap(idx1, idx2) {
            const newSquares = squares.slice();
            const swap = newSquares[idx1];
            newSquares[idx1] = newSquares[idx2];
            newSquares[idx2] = swap;
            return init(newSquares);
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
            return sum;
        }

        function getSquares() {
            return squares.slice();
        }

        return {
            swap : swap,
            evaluate : evaluate,
            squares : getSquares
        }

    }

    function create(seed) {
        Math.seedrandom(seed);
        return init();
    }

    return {
        create : create
    }


}