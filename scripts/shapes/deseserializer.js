const shapeTypes = {
    BALL: 'ball'
}

/*
 * What does a canvas have? What could it have?
 * Size, color shapes
 * What does a shape have?
 * Type, mass, location, velocity, color, border width, mass gravity exerts and affected, isTrailEnabled
 */

// Load board in paused state with all shapes staged
function deserializeGravityBoard(json, canvasId) {
    let props = JSON.parse(json);
    console.log(props);
    let gravityBoard = new GravityBoard();
    let factory = new ShapeFactory();
    gravityBoard.togglePause();
    if (props.shapes) {
        for (let i = 0; i < props.shapes.length; i++) {
            gravityBoard.stageBall(factory.createShape(props.shapes[i]));
            gravityBoard.saveStagedBall();
        }
    }
}

class ShapeFactory {
    createShape(props) {
        let shape;
        switch(props.type) {
            case shapeTypes.BALL:
                shape = this.createBall(props);
        }

        if (props.xVelocity)
            shape.accelerateXAxis(props.xVelocity);
        if (props.yVelocity)
            shape.accelerateYAxise(props.yVelocity);

        return shape;
    }
    

    createBall(props) {
        return new Ball(
            props.x,
            props.y,
            props.mass,
            props.isAffectedByGravity,
            props.exertsGravity,
            props.isTrailEnabled,
            props.width,
            props.borderWidth,
            props.color,
            props.borderColor
        );
    }
}