class MapOneScene {
    constructor(sketch, backgroundImage) {
        this.sketch = sketch;
        this.backgroundImage = backgroundImage;
    }

    display() {
        if (this.backgroundImage && this.backgroundImage.complete && this.backgroundImage.naturalWidth > 0) {
            this.sketch.drawingContext.drawImage(this.backgroundImage, 0, 0, this.sketch.width, this.sketch.height);
        }
    }
}