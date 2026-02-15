
/**
 * MovingAverageBuffer
 * Smooths out 'jitter' from the webcam feed and handles 
 * the 'Infinity' of transitions by tracking vector velocity.
 */
export class MovingAverageBuffer {
    constructor(size = 30, alpha = 0.6) {
        this.size = size;
        this.buffer = []; // Keep for velocity
        this.ema = null;  // Current EMA State
        this.alpha = alpha;
    }

    add(vector) {
        this.buffer.push(vector);
        if (this.buffer.length > this.size) {
            this.buffer.shift();
        }

        // EMA Calculation
        if (!this.ema) {
            this.ema = new Float32Array(vector);
        } else {
            for (let i = 0; i < vector.length; i++) {
                this.ema[i] = (this.alpha * vector[i]) + ((1 - this.alpha) * this.ema[i]);
            }
        }
    }

    getAverage() {
        // Return latest EMA
        return this.ema;
    }

    // Calculates how fast the user is moving in the vector space
    // Optional: indices array to check only specific dimensions (e.g. Core)
    getVelocity(indices = null) {
        if (this.buffer.length < 2) return 0;
        const current = this.buffer[this.buffer.length - 1];
        const previous = this.buffer[this.buffer.length - 2];
        const dim = current.length;

        let diff = 0;
        if (indices) {
            // Check only specific landmarks (each has x,y,z components)
            for (const idx of indices) {
                const base = idx * 3;
                if (base + 2 < dim) {
                    diff += Math.abs(current[base] - previous[base]);
                    diff += Math.abs(current[base + 1] - previous[base + 1]);
                    diff += Math.abs(current[base + 2] - previous[base + 2]);
                }
            }
        } else {
            // Check all
            for (let i = 0; i < dim; i++) {
                diff += Math.abs(current[i] - previous[i]);
            }
        }
        return diff;
    }
}
