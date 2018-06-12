function Autoplayer() {

    function play(game) {
        let result = [];
        result = result.concat(greedy(game));
        //result = result.concat(tentative(game));
        result = result.sort((a,b) => a.score - b.score);
        return result;
    }

    function tentative(game) {
        do {
            console.log("stepping");
            const steps = generateAllSteps(game);
            const score = game.evaluate();
            const step = chooseSlightlyBetter(score, steps);
            if (step) {
                game = step;
            } else {
                break;
            }
        } while (true);

        return [
            {
                name : "Tentative Robot",
                score : game.evaluate()
            }
        ];
    }

    function greedy(game) {
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



        return [
            {
                name: "Greedy Robot",
                score: deadends[0].evaluate()
            },
            {
                name: "Angry Greedy Robot",
                score: winner.evaluate()
            },

        ];
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
            for (let j = i+1; j < start.size * start.size; j++) {
                let next = start.swap(i,j);
                ret.push({
                    game : next,
                    score : next.evaluate(score)
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


    return {
        play : play
    };
}
