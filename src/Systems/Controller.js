export default class Controller {
    static rightClick(x, y) {
        // Check if click is within canvas bounds
        if (x < 0 || x > this.map.width || y < 0 || y > this.map.height) {
            // Click is outside the canvas, ignore it
            return null;
        }
        
        // Set hero move target
        const targetSpot = { x, y };
        console.log(`Hero moving to: ${x}, ${y}`);
        return targetSpot;
    }

    static stop(hero) {
        console.log('Hero stopped');
        hero.setComponent('velocity', { vx: 0, vy: 0 });
        return null;
    }
}