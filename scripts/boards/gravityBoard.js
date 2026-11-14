const MouseMode = {
    GRAVITY: 'GRAVITY',
    ADD: 'ADD'
}

const mouseDefaults = {
    mouseMass: 275,
    mouseMode: MouseMode.GRAVITY
}

const ui = {
    MOUSE_GRAVITY_INPUT: 'mouse-gravity',
    ADD_BALL_RADIO: 'add-ball-mode',
    GRAVITY_MODE_RADIO: 'gravity-mode',
    BALL_MASS: 'ball-mass',
    X_VELOCITY: 'x-velocity',
    Y_VELOCITY: 'y-velocity',
    EXERTS_GRAVITY: 'exerts-gravity',
    AFFECTED_BY_GRAVITY: 'affected-by-gravity',
    BALL_COLOR: 'ball-color',
    BALL_WIDTH: 'ball-width',
    BALL_BORDER_COLOR: 'ball-border-color',
    BALL_BORDER_WIDTH: 'ball-border-width',
    ADD_BUTTON: 'add-button',
    ADD_BALL_SETTINGS_WRAPPER: 'add-ball-settings',
    MOUSE_GRAVITY_SETTINGS_WRAPPER: 'mouse-gravity-settings',
    PAUSE_BUTTTON: 'pause-button'
}

class GravityBoard {
    #mouseMode;
    #shapes;
    #mouseBall;
    #stagedBall;
    #stagedShapes;

    constructor(canvasId, width, height) {
        this.canvas = document.getElementById(canvasId);
        this.canvas.width = width;
        this.canvas.height = height;
        this.context = this.canvas.getContext('2d');
        this.isPaused = false;

        this.#shapes = [];
        this.#stagedShapes = [];
        this.#mouseBall = new GravityBall(0, 0, 10, 2, 'red', 'white', mouseDefaults.mouseMass, false, false, true);
        this.#mouseMode = mouseDefaults.mouseMode;
        this.#stagedBall = null;
    }

    start() {
        setInterval(() => this.draw(), 1000 / 60); //TODO: Change to param
    }

    draw() {
        this.context.fillStyle = '#000000';
        this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);

        if (!this.isPaused) {
            // Calculate the change that get made before actually saving it
            for (let i = 0; i < this.#shapes.length; i++) {
                this.#shapes[i].stageGravityChange(this.#mouseBall);
                this.stageShapeGravities(i, this.#shapes[i]);
            }

            // Enact the total gravity change calculated in the previous loop
            for (let i = 0; i < this.#shapes.length; i++) {
                this.#shapes[i].enactGravityChange();
                this.#shapes[i].move();
                this.#shapes[i].render(this.context);
            }
        }

        else {
            for (let i = 0; i < this.#shapes.length; i++) {
                this.#shapes[i].render(this.context);
            }
        }

        if (this.#mouseBall.exertsGravity) {
            this.#mouseBall.render(this.context);
            this.#mouseBall.saveLocation();
        }

        if (this.#stagedBall != null) {
            this.renderGridLines(this.#stagedBall.x, this.#stagedBall.y);
            this.#stagedBall.render(this.context);
            this.#stagedBall.renderDetails(this.context);
            this.#stagedBall.saveLocation();
        }

        for (let i = 0; i < this.#stagedShapes.length; i++) {
            this.#stagedShapes[i].render(this.context);
            this.#stagedShapes[i].renderDetails(this.context);
            this.#stagedShapes[i].saveLocation();
        }

    }

    stageShapeGravities(index, currentShape) {
        for (let i = index + 1; i < this.#shapes.length; i++) {
            this.#shapes[i].stageGravityChange(currentShape);
            currentShape.stageGravityChange(this.#shapes[i]);
        }
    }

    addShape(shape) {
        this.#shapes.push(shape);
    }

    setMouseGravity(value) {
        this.#mouseBall.mass = value;
    }

    getMouseGravity() {
        return this.#mouseBall.mass;
    }

    setMouseMode(mode) {
        this.#mouseMode = mode;
    }

    toggleMouseGravity(isEnabled) {
        this.#mouseBall.exertsGravity = isEnabled;
    }

    stageBall(ball) {
        this.#stagedBall = ball;
    }

    adjustStagedBallMass(amount) {
        this.#stagedBall.mass += amount;
    }

    cancelStagedBall() {
        console.log('cancel');
        this.#stagedBall = null;
    }

    saveStagedBall() {
        if (this.isPaused) {
            this.#stagedShapes.push(this.#stagedBall);
        }
        else {
            let ball = new GravityBall(
                this.#stagedBall.x,
                this.#stagedBall.y,
                this.#stagedBall.width,
                this.#stagedBall.borderWidth,
                this.#stagedBall.color,
                this.#stagedBall.borderColor,
                this.#stagedBall.mass,
                this.#stagedBall.isAffectedByGravity,
                this.#stagedBall.exertsGravity,
                this.#stagedBall.isTrailEnabled,
            )
            ball.accelerateXAxis(this.#stagedBall.xVelocity);
            ball.accelerateYAxis(this.#stagedBall.yVelocity);
            this.#shapes.push(ball);
        }
        this.#stagedBall = null;
    }

    accelerateStagedBall(xVelocityChange, yVelocityChange) {
        if (this.#stagedBall) {
            this.#stagedBall.accelerateXAxis(xVelocityChange);
            this.#stagedBall.accelerateYAxis(yVelocityChange);
        }
    }

    updateControlCoordinates(x, y) {
        if (this.#stagedBall) {
            this.#stagedBall.x = x;
            this.#stagedBall.y = y;
            this.#stagedBall.saveLocation();
        }

        this.#mouseBall.x = x;
        this.#mouseBall.y = y;
        this.#mouseBall.saveLocation();
    }

    renderGridLines(x, y) {
        this.context.strokeStyle = 'white';

        this.context.moveTo(x, y);
        this.context.lineTo(x, 0);

        this.context.moveTo(x, y);
        this.context.lineTo(x, this.canvas.height);

        this.context.moveTo(x, y);
        this.context.lineTo(0, y);

        this.context.moveTo(x, y);
        this.context.lineTo(this.canvas.width, y);
        this.context.stroke();
    }

    togglePause() {
        if (this.isPaused) {
            for (let i = 0; i < this.#stagedShapes.length; i++) {
                let ball = new GravityBall(
                    this.#stagedShapes[i].x,
                    this.#stagedShapes[i].y,
                    this.#stagedShapes[i].width,
                    this.#stagedShapes[i].borderWidth,
                    this.#stagedShapes[i].color,
                    this.#stagedShapes[i].borderColor,
                    this.#stagedShapes[i].mass,
                    this.#stagedShapes[i].isAffectedByGravity,
                    this.#stagedShapes[i].exertsGravity,
                    this.#stagedShapes[i].isTrailEnabled,
                );
                ball.accelerateXAxis(this.#stagedShapes[i].xVelocity);
                ball.accelerateYAxis(this.#stagedShapes[i].yVelocity);
                this.#shapes.push(ball);
            }
            this.#stagedShapes = [];
        }
        this.isPaused = !this.isPaused;
    }

}

// Idea: use mouse pointer to select where the ball is going, use mouse wheel to select velocity
// Right click to cancel staging the new ball
class GravityBoardController {
    #board;
    constructor(board) {
        this.#board = board;
        this.mouseGravityInput = document.getElementById(ui.MOUSE_GRAVITY_INPUT);
        this.addBallRadio = document.getElementById(ui.ADD_BALL_RADIO);
        this.gravityModeRadio = document.getElementById(ui.GRAVITY_MODE_RADIO);
        this.ballMassInput = document.getElementById((ui.BALL_MASS));
        this.xVelocityInput = document.getElementById(ui.X_VELOCITY);
        this.yVelocityInput = document.getElementById(ui.Y_VELOCITY);
        this.exertsGravity = document.getElementById(ui.EXERTS_GRAVITY);
        this.affectedByGravity = document.getElementById(ui.AFFECTED_BY_GRAVITY);
        this.ballColor = document.getElementById(ui.BALL_COLOR);
        this.ballWidth = document.getElementById(ui.BALL_WIDTH);
        this.ballBorderWidth = document.getElementById(ui.BALL_BORDER_WIDTH);
        this.ballBorderColor = document.getElementById(ui.BALL_BORDER_COLOR)
        this.addButton = document.getElementById(ui.ADD_BUTTON);
        this.pauseButton = document.getElementById(ui.PAUSE_BUTTTON);

        this.mouseMode = MouseMode.ADD;
        this.isStaging = false;

        this.initializeElements();
        this.initializeListeners();
        this.evaluateMode();
    }

    initializeElements() {
        this.mouseGravityInput.value = mouseDefaults.mouseMass;
        this.#board.setMouseGravity(mouseDefaults.mouseMass);
        this.addBallRadio.checked = true;
        this.gravityModeRadio.checked = false;
        this.ballMassInput.value = 10;
        this.xVelocityInput.valule = 5;
        this.yVelocityInput.value = 5;
        this.exertsGravity.checked = false;
        this.affectedByGravity.checked = true;
        this.ballColor.value = 'blue';
        this.ballWidth.value = 10;
        this.ballBorderWidth.value = 2;
        this.isStaging = false;
    }

    initializeListeners() {
        this.mouseGravityInput.onchange = (event) => {
            let mouseGravity = event.target.value;
            if (isNaN(mouseGravity)) {
                event.target.value = null;
                return;
            }
        }

        let radioButtons = document.getElementsByClassName('mode-radio-button');
        for (let i = 0; i < radioButtons.length; i++) {
            radioButtons[i].addEventListener('click', () => {
                this.evaluateMode();
            });
        }

        this.#board.canvas.addEventListener('mousedown', (event) => {
            if (event.which == 1) // Left click
                this.handleMouseDown(event);
        });
        this.#board.canvas.addEventListener('mouseup', (event) => {
            if (event.which == 1)
                this.handleMouseUp(event);
        });
        this.#board.canvas.addEventListener('mousemove', (event) => {
            this.handleMouseMove(event);
        });

        this.pauseButton.addEventListener('click', () => {
            this.#board.togglePause();
        })

        this.#board.canvas.addEventListener('contextmenu', (event) => {
            event.preventDefault();
            this.#board.cancelStagedBall();
            return false;
        })

        this.#board.canvas.addEventListener('wheel', (event) => {
            if (this.isStaging) {
                event.preventDefault();
                let amount = event.deltaY < 0 ? 1 : -1;
                this.#board.adjustStagedBallMass(amount);
                this.ballMassInput.value = parseInt(this.ballMassInput.value) + amount;
                return false;
            }
        });

        document.addEventListener('keydown', (event) => {
            if (['w', 'a', 's', 'd'].includes(event.key)) {
                this.velocityAdjustment(event.key);
            }
        });

    }

    handleMouseDown(event) {
        this.isStaging = true;
        if (this.mouseMode === MouseMode.ADD) {
            this.isStaging = true;
            let width = this.ballWidth.value;
            let borderWidth = this.ballBorderWidth.value;
            let color = this.ballColor.value;
            let borderColor = this.ballBorderColor.value;
            let stagedball = new StagedBall(event.offsetX,
                event.offsetY,
                Number(width),
                borderWidth,
                color,
                borderColor,
                Number(this.ballMassInput.value),
                this.affectedByGravity.checked,
                this.exertsGravity.checked,
                true
            );
            stagedball.accelerateXAxis(Number(this.xVelocityInput.value));
            stagedball.accelerateYAxis(Number(this.yVelocityInput.value));
            this.#board.stageBall(stagedball);
        }

        else if (this.mouseMode === MouseMode.GRAVITY) {
            console.log(this.mouseGravityInput.value);
            this.#board.setMouseGravity(this.mouseGravityInput.value);
            this.#board.toggleMouseGravity(true);
        }
    }

    handleMouseUp(event) {
        this.#board.toggleMouseGravity(false);
        this.#board.saveStagedBall();
        this.isStaging = false;
    }

    handleMouseMove(event) {
        this.#board.updateControlCoordinates(event.offsetX, event.offsetY);
    }

    addBall(x, y) {
        if (!this.#board.isPaused) {
            let ball = new GravityBall(
                x,
                y,
                Number(this.ballWidth.value),
                Number(this.ballBorderWidth.value),
                this.ballColor.value,
                this.ballBorderColor.value,
                Number(this.ballMassInput.value),
                this.affectedByGravity.checked,
                this.exertsGravity.checked,
                true
            );
            ball.accelerateXAxis(Number(this.xVelocityInput.value));
            ball.accelerateYAxis(Number(this.yVelocityInput.value));
            this.#board.addShape(ball);
        }
    }

    evaluateMode() {
        if (this.addBallRadio.checked) {
            document.getElementById(ui.ADD_BALL_SETTINGS_WRAPPER).classList.remove('hidden');
            document.getElementById(ui.MOUSE_GRAVITY_SETTINGS_WRAPPER).classList.add('hidden');
            this.mouseMode = MouseMode.ADD;
        }
        else if (this.gravityModeRadio.checked) {
            document.getElementById(ui.ADD_BALL_SETTINGS_WRAPPER).classList.add('hidden');
            document.getElementById(ui.MOUSE_GRAVITY_SETTINGS_WRAPPER).classList.remove('hidden');
            this.mouseMode = MouseMode.GRAVITY;
        }
    }

    velocityAdjustment(key) {
        // TODO: Add input for this amount
        let adjustmentAmount = 0.1;
        let xAcceleration = 0;
        let yAcceleration = 0;
        switch (key) {
            case 'w':
                yAcceleration = adjustmentAmount
                this.yVelocityInput.value = Number(this.yVelocityInput.value) + adjustmentAmount;
                break;
            case 's':
                yAcceleration = -1 * adjustmentAmount;
                this.yVelocityInput.value -= adjustmentAmount;
                break;
            case 'a':
                xAcceleration = -1 * adjustmentAmount;
                this.xVelocityInput.value -= adjustmentAmount;
                break;
            case 'd':
                xAcceleration = adjustmentAmount;
                this.xVelocityInput.value += adjustmentAmount;
                break;
        }
        this.#board.accelerateStagedBall(xAcceleration, yAcceleration);
    }
}

window.onload = () => {
    board = new GravityBoard('field', 2560, 1200);

    let centerBall = new GravityBall(1280, 600, 30, 2, 'white', 'blue', 50, false, true, false);
    board.addShape(centerBall);

    // let topLeftBall = new GravityBall(350, 300, 30, 2, 'blue', 'white', 50, false, true, false);
    // board.addShape(topLeftBall);

    // let topRightBall = new GravityBall(350, 900, 30, 2, 'blue', 'white', 50, false, true, false);
    // board.addShape(topRightBall);

    // let bottomRightBall = new GravityBall(1050, 300, 30, 2, 'blue', 'white', 50, false, true, false);
    // board.addShape(bottomRightBall);

    // let bottomLeftBall = new GravityBall(1050, 900, 30, 2, 'blue', 'white', 50, false, true, false);
    // board.addShape(bottomLeftBall);

    // let ball = new GravityBall(500, 500, 10, 2, '#' + generateRandomColor(), 'black', 100, true, false, true);
    // ball.accelerateXAxis(1);
    // ball.accelerateYAxis(-.75);
    // board.addShape(ball);

    board.start();

    let controller = new GravityBoardController(board);

    document.getElementById('add-button').onclick = function () {

        for (let i = 0; i < 1; i++) {
            let ballX = Math.floor(Math.random() * ((board.canvas.width - 10) - (10 * 2))) + 10 * 2;
            let ballY = Math.floor(Math.random() * ((board.canvas.height - 10) - (10 * 2))) + 10 * 2;
            let color = '#' + generateRandomColor();
            let newBall = new GravityBall(ballX, ballY, 10, 2, color, 'black', 10, true, false, true);
            newBall.accelerateXAxis(Math.random() * 2);
            newBall.accelerateYAxis(Math.random() * 2);
            board.addShape(newBall);
        }
    }
}

function generateRandomColor() {
    return Math.floor(Math.random() * 16777215).toString(16);
}

function getRndInteger(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}