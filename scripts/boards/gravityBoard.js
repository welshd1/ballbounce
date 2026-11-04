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
    MOUSE_GRAVITY: 'mouse-gravity',
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
    MOUSE_GRAVITY_SETTINGS_WRAPPER: 'mouse-gravity-settings'
}

class GravityBoard {
    #mouseMode;
    #shapes;
    #mouseBall;
    #stagedBall;

    constructor(canvasId, width, height) {
        this.canvas = document.getElementById(canvasId);
        this.canvas.width = width;
        this.canvas.height = height;
        this.ctx = this.canvas.getContext('2d');

        this.#shapes = [];
        this.#mouseBall = new GravityBall(0, 0, 10, 2, 'red', 'white', mouseDefaults.mouseMass, false, false, false);
        this.#mouseMode = mouseDefaults.mouseMode;
        this.#stagedBall = null;
    }

    start() {
        setInterval(() => this.draw(), 1000 / 60); //TODO: Change to param
    }

    // Calculate the change that get made before actually saving it
    draw() {
        // this.ctx.fillStyle = 'LightGray';
        this.ctx.fillStyle = '#000000';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        for (let i = 0; i < this.#shapes.length; i++) {
            this.#shapes[i].stageGravityChange(this.#mouseBall);
            this.stageShapeGravities(i, this.#shapes[i]);
        }

        for (let i = 0; i < this.#shapes.length; i++) {
            this.#shapes[i].enactGravityChange();
            this.#shapes[i].move();
            this.#shapes[i].render(this.ctx);
        }

        if (this.#mouseBall.exertsGravity) {
            this.#mouseBall.render(this.ctx);
        }

        if (this.#stagedBall != null) {
            this.#stagedBall.render(this.ctx);
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

    unstageBall() {
        this.#stagedBall = null;
    }

    updateControlCoordinates(x, y) {
        if (this.#stagedBall) {
            this.#stagedBall.x = x;
            this.#stagedBall.y = y;
        }

        this.#mouseBall.x = x;
        this.#mouseBall.y = y;
    }

}

window.onload = () => {
    board = new GravityBoard('field', 1400, 1200);

    // let centerBall = new GravityBall(700, 600, 30, 50, false, true);
    // board.addShape(centerBall);

    let topLeftBall = new GravityBall(350, 300, 30, 2, 'blue', 'white', 50, false, true, false);
    board.addShape(topLeftBall);

    let topRightBall = new GravityBall(350, 900, 30, 2, 'blue', 'white', 50, false, true, false);
    board.addShape(topRightBall);

    let bottomRightBall = new GravityBall(1050, 300, 30, 2, 'blue', 'white', 50, false, true, false);
    board.addShape(bottomRightBall);

    let bottomLeftBall = new GravityBall(1050, 900, 30, 2, 'blue', 'white', 50, false, true, false);
    board.addShape(bottomLeftBall);

    let ball = new GravityBall(500, 500, 10, 2, '#' + generateRandomColor(), 'black', 100, true, false, true);
    ball.accelerateXAxis(1);
    ball.accelerateYAxis(-.75);
    board.addShape(ball);

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

    // board.canvas.addEventListener('mousedown', function (event) {
    //     board.handleMouseDown(event);
    // });

    // board.canvas.addEventListener('mousedown', function (event) {
    //     board.handleMouseDown(event);
    // });

    // board.canvas.addEventListener('mousemove', function (event) {
    //     board.handleMouseMove(event);
    // });

    // board.canvas.addEventListener('mouseup', function (event) {
    //     board.handleMouseUp(event);
    // });
}

function generateRandomColor() {
    return Math.floor(Math.random() * 16777215).toString(16);
}

function getRndInteger(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
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
        this.mouseGravityInput = document.getElementById(ui.MOUSE_GRAVITY);
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

        this.mouseMode = MouseMode.ADD;

        this.initializeElements();
        this.initializeListeners();
        this.evaluateMode();
    }

    initializeElements() {
        this.mouseGravityInput.value = mouseDefaults.mouseMass;

        this.mouseGravityInput.onchange = (event) => {
            let mouseGravity = event.target.value;
            if (isNaN(mouseGravity)) {
                event.target.value = null;
                return;
            }
            this.#board.setMouseGravity(mouseGravity);
            this.addBallRadio.checked = true;
            this.gravityModeRadio.checked = false;
        }
    }

    initializeListeners() {
        let radioButtons = document.getElementsByClassName('mode-radio-button');
        for (let i = 0; i < radioButtons.length; i++) {
            radioButtons[i].addEventListener('click', () => {
                this.evaluateMode();
            });
        }

        this.addButton.onclick = () => {
            this.addBall();
        }

        this.#board.canvas.addEventListener('mousedown', (event) => {
            this.handleMouseDown(event);
        });
        this.#board.canvas.addEventListener('mouseup', (event) => {
            this.handleMouseUp(event);
        });
        this.#board.canvas.addEventListener('mousemove', (event) => {
            this.handleMouseMove(event);
        });
    }

    handleMouseDown(event) {
        if (this.mouseMode === MouseMode.ADD) {
            console.log('mouse down add');
            let width = this.ballWidth.value;
            let borderWidth = this.ballBorderWidth.value;
            let color = this.ballColor.value;
            let borderColor = this.ballBorderColor.value;
            this.#board.stageBall(new StagedBall(event.offsetX,
                event.offsetY,
                width,
                borderWidth,
                color,
                borderColor,
            ));
        }

        else if (this.mouseMode === MouseMode.GRAVITY) {
            console.log(this.mouseGravityInput.value);
            this.#board.setMouseGravity(this.mouseGravityInput.value);
            this.#board.toggleMouseGravity(true);
        }
    }

    handleMouseUp(event) {
        this.#board.toggleMouseGravity(false);
        this.#board.unstageBall();

        if (this.mouseMode === MouseMode.ADD) {
            this.addBall(event.offsetX, event.offsetY);
        }
    }

    handleMouseMove(event) {
        this.#board.updateControlCoordinates(event.offsetX, event.offsetY);
    }

    addBall(x, y) {
        this.#board.addShape(new GravityBall(
            x,
            y,
            this.ballWidth.value,
            this.ballBorderWidth.value,
            this.ballColor.value,
            this.ballBorderColor.value,
            this.ballMassInput.value,
            this.affectedByGravity.checked,
            this.exertsGravity.checked,
            true
        ));
    }

    evaluateMode() {
        if (this.addBallRadio.checked) {
            document.getElementById(ui.ADD_BALL_SETTINGS_WRAPPER).classList.remove('hidden');
            document.getElementById(ui.MOUSE_GRAVITY_SETTINGS_WRAPPER).classList.add('hidden');
            console.log('set mouse mode to add')
            this.mouseMode = MouseMode.ADD;
        }
        else if (this.gravityModeRadio.checked) {
            document.getElementById(ui.ADD_BALL_SETTINGS_WRAPPER).classList.add('hidden');
            document.getElementById(ui.MOUSE_GRAVITY_SETTINGS_WRAPPER).classList.remove('hidden');
            console.log('set mouse mode to gravity')
            this.mouseMode = MouseMode.GRAVITY;
        }
    }
}