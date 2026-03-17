export default class GameMap {
    constructor(json) {
        console.log('Loading map:', json);
        this.width = json.size.width;
        this.height = json.size.height;
        this.objective = json.objective; 
        this.hero = json.hero;

        this.paths = json.paths || [];
        this.waves = json.waves || [];
    }

    // adjusted to grid-based map
    isPathCell(gridX, gridY) {
        // 
        let px = gridX * 40 + 20;
        let py = gridY * 40 + 20;
        let roadWidth = 50; // size of the path, can be adjusted based on actual map design

        // Check if the point (px, py) is within roadWidth/2 distance from any path segment
        for (let pathId in this.paths) {
            let waypoints = this.paths[pathId].waypoints;
            if (!waypoints) continue;

            for (let i = 0; i < waypoints.length - 1; i++) {
                let p1 = waypoints[i];
                let p2 = waypoints[i+1];
                
                // Check distance from (px, py) to the line segment defined by p1 and p2
                if (this.distToSegment(px, py, p1.x, p1.y, p2.x, p2.y) < roadWidth / 2) {
                    return true;
                }
            }
        }
        return false;
    }

    // helper function to calculate distance from point to line segment
    distToSegment(px, py, x1, y1, x2, y2) {
        let l2 = Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2);
        if (l2 === 0) return Math.sqrt(Math.pow(px - x1, 2) + Math.pow(py - y1, 2));
        let t = ((px - x1) * (x2 - x1) + (py - y1) * (y2 - y1)) / l2;
        t = Math.max(0, Math.min(1, t));
        return Math.sqrt(Math.pow(px - (x1 + t * (x2 - x1)), 2) + Math.pow(py - (y1 + t * (y2 - y1)), 2));
    }
}