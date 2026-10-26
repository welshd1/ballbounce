class GravityBoard {
    constructor(canvasId, width, height) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.width = width
        this.canvas.width = width
        this.height = height
        this.canvas.height = height
        this.shapes = [];
    }

    start() {
        setInterval(() => this.draw(), 1000 / 60); //TODO: Change to param
    }


    // Calculate the change that get made before actually saving it
    draw() {
        this.ctx.fillStyle = 'LightGray';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        for (let i = 0; i < this.shapes.length; i++) {
            this.stageShapeGravities(i, this.shapes[i]);
        }

        for (let i = 0; i < this.shapes.length; i++) {
            this.shapes[i].enactGravityChange();
            this.shapes[i].move();
            this.shapes[i].render(this.ctx);
        }

    }

    stageShapeGravities(index, currentShape) {
        for (let i = index + 1; i < this.shapes.length; i++) {
            this.shapes[i].stageGravityChange(currentShape);
            currentShape.stageGravityChange(this.shapes[i]);
        }
    }

    // Don't waste cycles rendering shapes out of bounds
    isShapeFullyInBounds(shape) {
        return true; //TODO: Implement this
    }

    addShape(shape) {
        this.shapes.push(shape);
    }
}

function generateRandomColor() {
    return Math.floor(Math.random() * 16777215).toString(16);
}

function getRndInteger(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

window.onload = () => {
    board = new GravityBoard('field', 500, 500);

    let ball = new GravityBall(100, 100, 10, 5, true);
    ball.accelerateXAxis(1);
    ball.accelerateYAxis(-.75);
    board.addShape(ball);

    // let ball = new GravityBall(100, 100, 10, 5, true);
    // // ball.accelerateXAxis(10);
    // board.addShape(ball);



    let gravityBall = new GravityBall(250, 250, 10, 10, false);
    board.addShape(gravityBall);

    let gravityBall2 = new GravityBall(50, 400, 10, 10, false);
    board.addShape(gravityBall2);

    let gravityBall3 = new GravityBall(400, 400, 10, 10, false);
    board.addShape(gravityBall3);

    board.start();
}

class GravityBall extends Ball {
    constructor(x, y, width, mass, isAffectedByGravity) {
        super(x, y, width);
        this.mass = mass;
        this.isAffectedByGravity = isAffectedByGravity;
        this.xVelocity = 0;
        this.yVelocity = 0;
        this.xVelocityChange = 0;
        this.yVelocityChange = 0;
    }

    stageGravityChange(ball) {
        if (!this.isAffectedByGravity)
            return;

        let xDiff = Math.abs(this.x - ball.x);
        let yDiff = Math.abs(this.y - ball.y);
        let r = Math.sqrt(Math.pow(xDiff, 2) + Math.pow(yDiff, 2));

        // G * M1 * M2/r^2
        let g = 10
        let f = g * this.mass * ball.mass / Math.pow(r, 2);

        // Find the x and y forces
        let xForce = (ball.x - this.x) * f / r;
        let yForce = (ball.y - this.y) * f / r;

        // Stage the changes here. After calculating it, you enact them
        console.log(xForce);
        this.xVelocityChange += xForce;
        this.yVelocityChange += yForce;
    }

    enactGravityChange() {
        this.xVelocity += this.xVelocityChange;
        this.yVelocity += this.yVelocityChange;

        this.xVelocityChange = 0;
        this.yVelocityChange = 0;
    }
}