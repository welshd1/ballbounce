var Balls = [];
var canvas;
var ctx;
var color = "blue";
var isGravityEnabled = true;

var BallSettings = {
    xVelocity: 2,
    yVelocity: 2,
    width: 10,
    height: 10,
    gravity: .5
}

window.onload = function () {
    canvas = document.getElementById('field');
    ctx = canvas.getContext('2d');
    canvas.height = 300;
    canvas.width = 500;
    setInterval(draw, 1000 / 60);
    intializeListeners();
}

class Ball {
    constructor(x, y) {
        this.color = '#' + generateRandomColor();
        this.x = x;
        this.y = y;
        this.xVelocity = getRndInteger(1, 5);
        this.yVelocity = getRndInteger(1, 5);
        if (Math.floor(Math.random() * 2) === 1) this.xVelocity = -this.xVelocity;
        if (Math.floor(Math.random() * 2) === 1) this.yVelocity = -this.yVelocity;
    }

    render() {
        ctx.beginPath();
        ctx.fillStyle = this.color;
        ctx.strokeStyle = 'black';
        ctx.lineWidth = 2;
        ctx.arc(this.x, this.y, BallSettings.width, 0, Math.PI * 2, true);
        ctx.fill();
        ctx.stroke();
        ctx.closePath();
    }

    move() {
        this.x += this.xVelocity;
        if (this.y + this.yVelocity <= canvas.height - BallSettings.width) {
            this.y += this.yVelocity;
        }
        else {
            this.y = canvas.height - BallSettings.width
        }
    }

    reverseX() {
        this.xVelocity = -this.xVelocity;
        this.color = '#' + generateRandomColor();
    }

    reverseY() {
        this.yVelocity = -this.yVelocity;
        this.color = '#' + generateRandomColor();
    }

    evaluatePosition() {

        //Bounce Ball Off Left
        if (this.x - BallSettings.width <= 0) {
            this.reverseX();
        }
        //Bounce Ball Off Right
        if (this.x + BallSettings.width >= canvas.width) {
            this.reverseX();
        }

        // If ball is at the bottom and its current velocity is equal to gravity, don't bounce
        if (this.isTouchingBottom() && this.yVelocity == BallSettings.gravity) {
            return;
        }

        //Bounce Ball Off Top
        if (this.y - BallSettings.width <= 0) {
            this.reverseY();
        }

        //Bounce Ball Off Bottom
        if (this.isTouchingBottom()) {
            this.reverseY();
        }

        if (isGravityEnabled && this.y + this.yVelocity <= canvas.height) {
            this.yVelocity += BallSettings.gravity;
        }
    }

    isTouchingBottom() {
        return this.y + BallSettings.width >= canvas.height
    }

    intersect(index) {
        for (let i = 0; i < Balls.length; i++) {

            if (i != index) {
                if (this.x = Balls[i].x) this.reverseX();
                if (this.y = Balls[i].y) this.reverseY();
            }
        }
    }
}

function draw() {
    if (canvas.isPaused) return;

    ctx.fillStyle = 'LightGray';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    for (let i = 0; i < Balls.length; i++) {
        Balls[i].render();
        Balls[i].evaluatePosition();
        Balls[i].move();
    }
}

function intializeListeners() {
    document.getElementById('pause-button').onclick = function () {
        if (canvas.isPaused) {
            canvas.isPaused = false;
            this.textContent = 'Pause';
        } else {
            canvas.isPaused = true;
            this.textContent = 'Unpause';
        }
    };

    document.getElementById('remove-button').onclick = function () {
        Balls.pop();
    }

    document.getElementById('gravity-button').onclick = function () {
        console.log("gravity toggle")
        isGravityEnabled = !isGravityEnabled;
    }

    document.getElementById('add-button').onclick = function () {

        for (i = 0; i < 10; i++) { //Change loop to add more balls at once
            let ballX = Math.floor(Math.random() * ((canvas.width - BallSettings.width) - (BallSettings.width * 2))) + BallSettings.width * 2;
            let ballY = Math.floor(Math.random() * ((canvas.height - BallSettings.height) - (BallSettings.height * 2))) + BallSettings.height * 2;
            Balls.push(new Ball(ballX, ballY));
        }
        let ballX = Math.floor(Math.random() * ((canvas.width - BallSettings.width) - (BallSettings.width * 2))) + BallSettings.width * 2;
        let ballY = Math.floor(Math.random() * ((canvas.height - BallSettings.height) - (BallSettings.height * 2))) + BallSettings.height * 2;
        Balls.push(new Ball(ballX, ballY));
    }

    document.getElementById('clear-button').onclick = function () {
        if (window.confirm('Are you sure you want to clear the canvas?')) Balls = [];
    }

    document.getElementById('canvas-height').onchange = function () {
        if (this.valueAsNumber && this.valueAsNumber >= 100) canvas.height = this.valueAsNumber;
        else alert('The minimum height is 100.');
    }

    document.getElementById('canvas-width').onchange = function () {
        if (this.valueAsNumber && this.valueAsNumber >= 100) canvas.width = this.valueAsNumber;
        else alert('The minimum width is 100.');
    }

}

function generateRandomColor() {
    return Math.floor(Math.random() * 16777215).toString(16);
}

function getRndInteger(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}