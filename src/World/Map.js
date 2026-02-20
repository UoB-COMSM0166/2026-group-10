export default class Map {
    constructor(json) {
        console.log('Loading map:', json);
        this.width = json.size.width;
        this.height = json.size.height;
        this.objective = json.objective; 
        this.hero = json.hero;

        this.paths = json.paths || [];
        this.waves = json.waves || [];
        
        // Create path lookup by path_id
        this.path = {};
        if (this.paths && Array.isArray(this.paths)) {
            this.paths.forEach(p => {
                this.path[p.path_id] = p;
            });
        }
    }
}