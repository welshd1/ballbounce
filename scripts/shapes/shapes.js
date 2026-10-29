const trailLength = 25;

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
        this.color = '#' + generateRandomColor();
        this.x = x;
        this.y = y;
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
    constructor(x, y, width, isTrailEnabled) {
        super(x, y, isTrailEnabled);
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

        if (this.isTrailEnabled) {
            context.beginPath();
            context.moveTo(this.x, this.y);
            context.strokeStyle = 'black';
            context.lineWidth = 2;
            let lineStart = this.locationList.head;
            while (this.isTrailEnabled && lineStart != null) {
                context.lineTo(lineStart.x, lineStart.y);
                lineStart = lineStart.next;
            }
            context.stroke();
        }

    }

    getTotalWidth() {
        return this.width + 4; // Width + both sides of border
    }

    getTotalHeight() {
        return this.width + 4;
    }
}


class GravityBall extends Ball {
    constructor(x, y, width, mass, isAffectedByGravity, exertsGravity, isTrailEnabled) {
        super(x, y, width, isTrailEnabled);
        this.mass = mass;
        this.isAffectedByGravity = isAffectedByGravity;
        this.exertsGravity = exertsGravity;
        this.xVelocity = 0;
        this.yVelocity = 0;
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