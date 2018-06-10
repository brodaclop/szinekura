function Autoplayer() {

    function play(game) {
        const max_shakes = 5;
        let shakes = 0;

        let deadends = [];

        do {
            const steps = generateAllSteps(game);
            const step = chooseOptimal(steps);
            if (step.evaluate() < game.evaluate()) {
                game = step;
            } else {
                if (shakes < max_shakes) {
                    deadends.push(game);
                    shakes++;
                    game = shake(game);
                }
                break;
            }
        } while (true);

        let min = 1000;
        let winner = null;

        deadends.forEach(e => {
            if (e.evaluate() < min) {
                min = e.evaluate;
                winner = e;
            }
        });

        return winner;
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
        for (let i = 0; i < start.size * start.size; i++) {
            for (let j = i+1; j < start.size * start.size; j++) {
                let next = start.swap(i,j);
                ret.push({
                    game : next,
                    score : next.evaluate()
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

    function chooseRandom(steps) {
        let idx = Math.floor(Math.random() * steps.length);
        return steps[idx].game;
    }


    return {
        play : play
    };
}
