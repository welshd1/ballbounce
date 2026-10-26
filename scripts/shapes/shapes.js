class Shape {
    constructor(x, y) {
        this.color = '#' + generateRandomColor();
        this.x = x;
        this.y = y;
        // this.xVelocity = getRndInteger(1, 5);
        // this.yVelocity = getRndInteger(1, 5);
        if (Math.floor(Math.random() * 2) === 1) this.xVelocity = -this.xVelocity;
        if (Math.floor(Math.random() * 2) === 1) this.yVelocity = -this.yVelocity;
    }

    // Abstract Methods
    render(context) {
        throw new Error("Render not implemented on " + this.constructor.name)
    }

    getTotalHeight() {
        throw new Error("getTotalHeight not implemented on " + this.constructor.name)
    }

    getTotalWidth() {
        throw new Error("getTotalWidth not implemented on " + this.constructor.name)
    }

    // Pass in + or - numbers to increment value
    accelerateYAxis(amount) {
        this.yVelocity += amount;
    }

    // Pass in + or - numbers to increment value
    accelerateXAxis(amount) {
        this.xVelocity += amount;
    }

    move() {
        this.x += this.xVelocity;
        this.y += this.yVelocity;
    }

    reverseX() {
        this.xVelocity = -this.xVelocity;
        this.color = '#' + generateRandomColor();
    }

    reverseY() {
        this.yVelocity = -this.yVelocity;
        this.color = '#' + generateRandomColor();
    }

}

class Ball extends Shape {
    constructor(x, y, width) {
        super(x, y);
        this.width = width;
    }

    render(context) {
        context.beginPath();
        context.fillStyle = this.color;
        context.strokeStyle = 'black';
        context.lineWidth = 2;
        context.arc(this.x, this.y, this.width, 0, Math.PI * 2, true);
        context.fill();
        context.stroke();
        context.closePath();
    }

    getTotalWidth() {
        return this.width + 4; // Width + both sides of border
    }

    getTotalHeight() {
        return this.width + 4;
    }
}