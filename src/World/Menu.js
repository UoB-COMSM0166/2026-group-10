class Menu {
    constructor() {
        this.p = null;
        this.music = true;
        this.sound = true;
        this.manager = null;
    }

    static start() {
        const p5Ctor = window.p5;
        const menu = new Menu();
        new p5Ctor((p) => menu.#bindP5(p));
        return menu;
    }

    #bindP5(p) {
        this.p = p;
        p.setup = () => this.setup();
        p.draw = () => this.draw();
        p.mousePressed = () => this.mousePressed();
        p.keyPressed = () => this.keyPressed();
        // ... additional bindings as needed
    }
}