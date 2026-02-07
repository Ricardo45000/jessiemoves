export function calculateAngle(a, b, c) {
    // Use x and y coordinates. MediaPipe also provides z (depth), but 2D is usually sufficient for simple angles.
    // a: first point
    // b: middle point (vertex)
    // c: end point

    if (!a || !b || !c) return 0;

    const radians = Math.atan2(c.y - b.y, c.x - b.x) - Math.atan2(a.y - b.y, a.x - b.x);
    let angle = Math.abs((radians * 180.0) / Math.PI);

    if (angle > 180.0) {
        angle = 360 - angle;
    }

    return angle;
}

export function calculateDistance(a, b) {
    if (!a || !b) return 0;
    return Math.sqrt(Math.pow(a.x - b.x, 2) + Math.pow(a.y - b.y, 2));
}
