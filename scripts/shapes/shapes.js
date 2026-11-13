const trailLength = 25;
const minArrowLength = 50;

class LocationList {
    constructor(startingX, startingY) {
        let startingLocation = new Location(startingX, startingY, null, null);
        this.head = startingLocation;
        this.tail = startingLocation;
        this.length = 1;
    }

    append(x, y) {
        let newHead = new Location(x, y, this.head, null);
        this.head.prev = newHead;
        this.head = newHead;

        if (this.length >= trailLength) {
            this.tail = this.tail.prev;
            this.tail.next = null;
        }
        else {
            this.length++;
        }
    }
}

class Location {
    constructor(x, y, next, prev) {
        this.x = x;
        this.y = y;
        this.next = next;
        this.prev = prev;
    }
}


class Shape {
    constructor(x, y, trailEnabled) {
        // this.color = '#' + generateRandomColor();
        this.x = x;
        this.y = y;
        this.xVelocity = 0;
        this.yVelocity = 0;
        this.isTrailEnabled = trailEnabled;
        this.locationList = new LocationList(x, y);
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
        this.locationList.append(this.x, this.y);
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
    constructor(x, y, width, borderWidth, color, borderColor, isTrailEnabled) {
        super(x, y, isTrailEnabled);
        this.width = width;
        this.borderWidth = borderWidth;
        this.color = color;
        this.borderColor = borderColor;
    }

    render(context) {

        // Render trail first so it's behind the ball 
        if (this.isTrailEnabled) {
            context.beginPath();
            context.moveTo(this.x, this.y);
            context.strokeStyle = this.color;
            context.lineWidth = this.getTotalWidth();
            let decrement = context.lineWidth / trailLength;
            let lineStart = this.locationList.head;
            while (this.isTrailEnabled && lineStart != null) {
                context.lineTo(lineStart.x, lineStart.y);
                lineStart = lineStart.next;
                context.lineWidth -= decrement;
                context.stroke();
            }
        }

        context.beginPath();
        context.fillStyle = this.color;
        context.strokeStyle = this.borderColor;
        context.lineWidth = this.borderWidth;
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

class StagedBall extends Ball {

    constructor(x, y, width, borderWidth, color, borderColor) {
        super(x, y, width, borderWidth, color, borderColor, false);
        this.isStaged = false;
    }

    // Draw arrow to show direction of the ball on launch
    render(context) {

        // context.strokeStyle = invertColor(context.fillStyle);
        context.beginPath();
        context.strokeStyle = 'yellow';
        // context.lineWidth = 7;
        context.moveTo(this.x, this.y);
        let width = this.getTotalWidth();

        // Point and draw the line of the arrow
        let xWidthAdustment = this.xVelocity > 0 ? width + minArrowLength : width * -1 - minArrowLength;
        let yWidthAdustment = this.yVelocity > 0 ? width + minArrowLength : width * -1 - minArrowLength;

        // Get line length
        let xLength = xWidthAdustment + this.xVelocity;
        let yLength = yWidthAdustment + this.yVelocity;
        let absXLength = Math.abs(xLength);
        let absYLength = Math.abs(yLength);
        let arrowPointX = this.xVelocity === 0 ? this.x : this.x + xLength;
        let arrowPointY = this.yVelocity === 0 ? this.y : this.y + yLength;

        // Get line slope and offset
        let slope = (arrowPointY - this.y) / (arrowPointX - this.x);
        let b = this.y - slope * this.x;

        // Use the greater value to decrement the width
        let widthDecrement;
        context.lineWidth = width;
        if (Math.abs(this.xVelocity) > Math.abs(this.yVelocity)) {
            // Decrement the width of the line as we draw
            widthDecrement = width / absXLength;
            let remainingLength = absXLength;
            let lengthIncrement = absXLength / 100;
            if (this.xVelocity < 0)
                lengthIncrement = lengthIncrement * -1;

            let previousPoint = this.x;
            while (remainingLength > 0) {
                let x = previousPoint + lengthIncrement;
                let y = findY(slope, x, b);
                context.lineTo(x, y);
                context.stroke();
                previousPoint = x;
                remainingLength -= Math.abs(lengthIncrement);
                context.lineWidth -= widthDecrement;
            }
        }
        // Slope of a vertical line is undefined
        else if (Math.abs(this.yVelocity) > 0 && this.xVelocity === 0) {
            // Decrement the width of the line as we draw
            widthDecrement = width / absYLength;
            let remainingLength = absYLength;
            let lengthIncrement = absYLength / 100;
            if (this.yVelocity < 0)
                lengthIncrement = lengthIncrement * -1;

            let previousPoint = this.y;
            while (remainingLength > 0) {
                let y = previousPoint + lengthIncrement;
                context.lineTo(this.x, y);
                context.stroke();
                previousPoint = y;
                remainingLength -= Math.abs(lengthIncrement);
                context.lineWidth -= widthDecrement;
            }
        }
        else {
            // Decrement the width of the line as we draw
            widthDecrement = width / absYLength;
            let remainingLength = absYLength;
            let lengthIncrement = absYLength / 100;
            if (this.yVelocity < 0)
                lengthIncrement = lengthIncrement * -1;

            let previousPoint = this.y;
            while (remainingLength > 0) {
                let y = previousPoint + lengthIncrement;
                let x = findX(slope, y, b);
                context.lineTo(x, y);
                context.stroke();
                previousPoint = y;
                remainingLength -= Math.abs(lengthIncrement);
                context.lineWidth -= widthDecrement;
            }
        }
        context.closePath();



        // context.lineTo(arrowPointX, arrowPointY);

        context.stroke();
        context.closePath();
        super.render(context)
    }
}

class GravityBall extends Ball {
    constructor(x, y, width, borderWidth, color, borderColor, mass, isAffectedByGravity, exertsGravity, isTrailEnabled) {
        super(x, y, width, borderWidth, color, borderColor, isTrailEnabled);
        this.mass = mass;
        this.isAffectedByGravity = isAffectedByGravity;
        this.exertsGravity = exertsGravity;
        // this.xVelocity = 0;
        // this.yVelocity = 0;
        this.xVelocityChange = 0;
        this.yVelocityChange = 0;
    }

    stageGravityChange(ball) {
        if (!this.isAffectedByGravity || !ball.exertsGravity)
            return;

        // Limit the pull of gravity so it doesn't shoot the balls off the canvas
        let maxDistance = ball.getTotalWidth() + this.getTotalWidth();

        let xDiff = Math.abs(this.x - ball.x);
        if (xDiff < maxDistance)
            xDiff = maxDistance;

        let yDiff = Math.abs(this.y - ball.y);
        if (yDiff < maxDistance)
            yDiff = maxDistance;

        let r = Math.sqrt(Math.pow(xDiff, 2) + Math.pow(yDiff, 2));

        // G * M1 * M2/r^2
        // let g = 10
        let g = 9.8;
        let f = g * this.mass * ball.mass / Math.pow(r, 2);

        // Find the x and y forces
        let xForce = (ball.x - this.x) * f / r;
        let yForce = (ball.y - this.y) * f / r;

        // Stage the changes here. After calculating it, you enact them
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

// Source - https://stackoverflow.com/a/35970186
// Posted by Onur Yıldırım, modified by community. See post 'Timeline' for change history
// Retrieved 2026-11-04, License - CC BY-SA 4.0

function invertColor(hex) {
    if (hex.indexOf('#') === 0) {
        hex = hex.slice(1);
    }
    // convert 3-digit hex to 6-digits.
    if (hex.length === 3) {
        hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
    }
    if (hex.length !== 6) {
        throw new Error('Invalid HEX color.');
    }
    // invert color components
    var r = (255 - parseInt(hex.slice(0, 2), 16)).toString(16),
        g = (255 - parseInt(hex.slice(2, 4), 16)).toString(16),
        b = (255 - parseInt(hex.slice(4, 6), 16)).toString(16);
    // pad each with zeros and return
    return '#' + padZero(r) + padZero(g) + padZero(b);
}

function padZero(str, len) {
    len = len || 2;
    var zeros = new Array(len).join('0');
    return (zeros + str).slice(-len);
}

function findY(m, x, b) {
    return m * x + b;
}

function findX(m, y, b) {
    return (y - b) / m;
}