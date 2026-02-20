class MapOneScene {
    constructor(backgroundImage) {
        this.backgroundImage = backgroundImage;
    }

    display() {
        image(this.backgroundImage, 0, 0, width, height);
    }
}