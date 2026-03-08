export default class GameMap {
    constructor(json) {
        console.log('Loading map:', json);
        this.width = json.size.width;
        this.height = json.size.height;
        this.objective = json.objective; 
        this.hero = json.hero;

        this.paths = new Map();
        for (let [key, value] of Object.entries(json.paths || {})) {
            this.paths.set(key, new Lane(key, value.spawn, value.waypoint));
        }

        this.waves = json.waves || [];
    }
}

class Lane {
    constructor(id, spawn, waypoint) {
        this.id = id;
        this._spawn = spawn || { x: 0, y: 0 };
        this._waypoint = waypoint || [];
    }

    get spawn() {
        return this._spawn;
    }

    get waypoint() {
        return this._waypoint;
    }
}