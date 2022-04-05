importScripts("state.js");

const state = State();

onmessage = function (e) {
    const game = state.__robotCheat(e.data);

    const ROBOTS = {
        "Impatient": impatient,
        "Greedy": greedy,
        "Simpleton": simpleton,
        "Tentative": tentative,
        "Angry/Greedy": angry_greedy
    };

    Object.keys(ROBOTS).forEach(r => postMessage({ name: r, score: null }));
    Object.values(ROBOTS).forEach(strategy => postMessage(strategy(game)))
    close();

    function tentative(game) {
        do {
            const score = game.evaluate();
            const steps = generateAllSteps(game);
            const step = chooseSlightlyBetter(score, steps);
            if (step) {
                game = step;
            } else {
                break;
            }
        } while (true);

        return {
            name: "Tentative",
            score: game.evaluate()
        };
    }



    function angry_greedy(game) {
        const max_shakes = 5;
        let shakes = 0;
        let deadends = [];

        do {
            const steps = generateAllSteps(game);
            const step = chooseOptimal(steps);
            if (step.evaluate() < game.evaluate()) {
                game = step;
            } else {
                deadends.push(game);
                if (shakes < max_shakes) {
                    shakes++;
                    game = shake(game);
                } else {
                    break;
                }
            }
        } while (true);

        let min = 1000;
        let winner = null;

        deadends.forEach(e => {
            if (e.evaluate() < min) {
                min = e.evaluate();
                winner = e;
            }
        });

        return {
            name: "Angry/Greedy",
            score: winner.evaluate()
        };
    }

    function simpleton(game) {
        let squares = game.squares().sort((a, b) => a.hue - b.hue);
        game = state.__robotCheat(squares);
        return {
            name: "Simpleton",
            score: game.evaluate()
        };
    }

    function greedy(game) {
        do {
            const steps = generateAllSteps(game);
            const step = chooseOptimal(steps);
            if (step.evaluate() < game.evaluate()) {
                game = step;
            } else {
                break;
            }
        } while (true);

        return {
            name: "Greedy",
            score: game.evaluate()
        };
    }

    function impatient(game) {
        let steplimit = 10;
        do {
            const steps = generateAllSteps(game);
            const step = chooseOptimal(steps);
            if (step.evaluate() < game.evaluate()) {
                game = step;
            } else {
                break;
            }
        } while (--steplimit > 0);

        return {
            name: "Impatient",
            score: game.evaluate()
        };
    }

    function shake(game) {
        for (let i = 0; i < 10; i++) {
            const steps = generateAllSteps(game);
            game = chooseRandom(steps);
        }
        return game;
    }

    function generateAllSteps(start) {
        let ret = [];
        const score = start.evaluate();
        for (let i = 0; i < start.size * start.size; i++) {
            for (let j = i + 1; j < start.size * start.size; j++) {
                let next = start.swap(i, j);
                ret.push({
                    game: next,
                    score: next.evaluate(score)
                });
            }
        }
        return ret;
    }

    function chooseOptimal(steps) {
        let min = 1000;
        let step = null;
        steps.forEach(e => {
            if (e.score < min) {
                step = e.game;
                min = e.score;
            }
        });
        return step;
    }

    function chooseSlightlyBetter(baseScore, steps) {
        let min = 0;
        let step = null;
        steps.forEach(e => {
            if (e.score < baseScore && e.score > min) {
                step = e.game;
                min = e.score;
            }
        });
        return step;
    }


    function chooseRandom(steps) {
        let idx = Math.floor(Math.random() * steps.length);
        return steps[idx].game;
    }
};
