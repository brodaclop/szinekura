function Autoplayer() {


    function play(_game, result) {

        const startState = {
            finished : false,
            game : _game,
            steplimit : 10
        };

        setTimeout(() => runRobot(impatient, startState, result, 
                   () => runRobot(greedy, startState, result, 
                   () => runRobot(simpleton, startState, result, 
                   () => runRobot(tentative, startState, result, 
                   () => runRobot(angry_greedy, startState, result))))), 0);


        function runRobot(robot, state, result, next) {
            var endState = robot(state);
            if (endState.finished) {
                result.push(endState.result);
                console.log("After run", result);
                if (next) {
                    setTimeout(next,0);
                }
            } else {
                setTimeout(() => runRobot(robot, endState, result, next), 100);
            }
        }

        function tentative(state) {
            let steplimit = state.steplimit;
            let game = state.game;
            do {
                const score = game.evaluate();
                const steps = generateAllSteps(game);
                const step = chooseSlightlyBetter(score, steps);
                if (step) {
                    game = step;
                } else {
                    break;
                }
            } while (--steplimit > 0);
            if (steplimit == 0) { // we haven't finished yet
            
                return {
                    finished : false,
                    game : game,
                    steplimit : state.steplimit
                };
            } else {
                return {
                    finished : true,
                    result : {
                        name : "Tentative Robot",
                        score : game.evaluate()
                    }
                };
            }
        }



        function angry_greedy(state) {
            const max_shakes = 5;
            let shakes = state.shakes || 0;
            let deadends = state.deadends || [];
            let game = state.game;
            let steplimit = state.steplimit;

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
            } while (--steplimit > 0);

            if (steplimit == 0) {
                return {
                    finished : false,
                    game : game,
                    steplimit : state.steplimit,
                    shakes : shakes,
                    deadends : deadends
                }
            } else {
                let min = 1000;
                let winner = null;
    
                deadends.forEach(e => {
                    if (e.evaluate() < min) {
                        min = e.evaluate();
                        winner = e;
                    }
                });

                return {
                    finished : true,
                    result : {
                        name: "Angry Greedy Robot",
                        score: winner.evaluate()
                    }
                }
            }
        }

        function simpleton(state) {
            let game = state.game;
            let squares =  game.squares().sort((a,b) => a.hue - b.hue);
            game = game.__robotCheat(squares);
            return {
                finished : true,
                result : {
                    name : "Simpleton Robot",
                    score : game.evaluate()
                }
            };
        }

        function greedy(state) {
            let game = state.game;
            let steplimit = state.steplimit;
            do {
                const steps = generateAllSteps(game);
                const step = chooseOptimal(steps);
                if (step.evaluate() < game.evaluate()) {
                    game = step;
                } else {
                    break;
                }
            } while (--steplimit > 0);

            if (steplimit == 0) {
                return {
                    finished : false,
                    game : game,
                    steplimit : state.steplimit
                }
            } else {
                return {
                    finished : true,
                    result : {
                        name: "Greedy Robot",
                        score: game.evaluate()
                    }
                }
            }
        }

        function impatient(state) {
            let game = state.game;
            let steplimit = state.steplimit;
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
                finished : true,
                result : {
                    name: "Impatient Robot",
                    score: game.evaluate()
                }
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
    }


    return {
        play : play
    };
}
