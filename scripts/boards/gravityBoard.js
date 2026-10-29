const mouseDefaults = {
    mouseMass: 20
}

const MouseMode = {
    GRAVITY: 'GRAVITY',
    ADD: 'ADD'
}

const ui = {
    MOUSE_GRAVITY_INPUT: 'mouse-gravity'
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
        this.#mouseBall = new GravityBall(0, 0, 10, mouseDefaults.mouseMass, false, false, false);
        this.#mouseMode = MouseMode.GRAVITY;
        this.#stagedBall = null;
    }

    start() {
        setInterval(() => this.draw(), 1000 / 60); //TODO: Change to param
    }

    // Calculate the change that get made before actually saving it
    draw() {
        this.ctx.fillStyle = 'LightGray';
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

    handleMouseDown(event) {
        if (this.#mouseMode === MouseMode.GRAVITY) {
            this.#mouseBall.exertsGravity = true;
            return;
        }

        this.#stagedBall = new GravityBall(event.offsetX, event.offsetY, 10, 10, false, false);
    }

    handleMouseUp(event) {
        if (this.#mouseMode === MouseMode.GRAVITY) {
            this.#mouseBall.exertsGravity = false;
            return;
        }
        this.#stagedBall.isAffectedByGravity = true; // This will need to change for the user to add static balls
        this.#shapes.push(this.#stagedBall);
        this.#stagedBall = null;
    }

    handleMouseMove(event) {
        if (this.#mouseMode === MouseMode.GRAVITY) {
            this.#mouseBall.x = event.offsetX;
            this.#mouseBall.y = event.offsetY;
            return;
        }
        this.#stagedBall.x = event.offsetX;
        this.#stagedBall.y = event.offsetY;
    }

    setMouseGravity(value) {
        this.#mouseBall.mass = value;
    }

    getMouseGravity() {
        return this.#mouseBall.mass;
    }
}

window.onload = () => {
    board = new GravityBoard('field', 1400, 1200);

    let ball = new GravityBall(500, 500, 10, 100, true, false, true);
    ball.accelerateXAxis(1);
    ball.accelerateYAxis(-.75);
    board.addShape(ball);

    // let centerBall = new GravityBall(700, 600, 30, 50, false, true);
    // board.addShape(centerBall);

    let topLeftBall = new GravityBall(350, 300, 30, 50, false, true, false);
    board.addShape(topLeftBall);

    let topRightBall = new GravityBall(350, 900, 30, 50, false, true, false);
    board.addShape(topRightBall);

    let bottomRightBall = new GravityBall(1050, 300, 30, 50, false, true, false);
    board.addShape(bottomRightBall);

    let bottomLeftBall = new GravityBall(1050, 900, 30, 50, false, true, false);
    board.addShape(bottomLeftBall);

    board.start();

    let controller = new GravityBoardController(board);

    document.getElementById('add-button').onclick = function () {

        for (let i = 0; i < 50; i++) {
            let ballX = Math.floor(Math.random() * ((board.canvas.width - 10) - (10 * 2))) + 10 * 2;
            let ballY = Math.floor(Math.random() * ((board.canvas.height - 10) - (10 * 2))) + 10 * 2;
            let newBall = new GravityBall(ballX, ballY, 10, 10, true, false, true);
            newBall.accelerateXAxis(Math.random() * 2);
            newBall.accelerateYAxis(Math.random() * 2);
            board.addShape(newBall);
        }
    }

    board.canvas.addEventListener('mousedown', function (event) {
        board.handleMouseDown(event);
    });

    board.canvas.addEventListener('mousemove', function (event) {
        board.handleMouseMove(event);
    });

    board.canvas.addEventListener('mouseup', function (event) {
        board.handleMouseUp(event);
    });
}

function generateRandomColor() {
    return Math.floor(Math.random() * 16777215).toString(16);
}

function getRndInteger(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

class GravityBoardController {
    #board;
    constructor(board) {
        this.#board = board;
        this.mouseGravityInput = document.getElementById(ui.MOUSE_GRAVITY_INPUT);
        this.initializeElements();
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
            console.log('Mouse gravity set to ' + this.#board.getMouseGravity());
        }
    }
}