export default class Sprite {
    constructor(spriteData, drawWidth = 128, drawHeight = 128, animationSpeed = 0.15) {
        this.image = spriteData?.image || null;
        this.frames = spriteData?.frames || 1;
        this.drawWidth = drawWidth;
        this.drawHeight = drawHeight;
        this.animationSpeed = animationSpeed;
        
        if (this.image) {
            this.spriteWidth = this.image.width / this.frames;
            this.spriteHeight = this.image.height;
        }
    }

    draw(p5, x, y, animate = true, flipX = false) {
        if (!this.image) return;

        let currentFrame = 0;
        if (animate) {
            // Calculate which frame we should be on based on the frame count
            currentFrame = Math.floor(p5.frameCount * this.animationSpeed) % this.frames;
        }
        
        const sx = currentFrame * this.spriteWidth;
        const sy = 0; // Assuming a single row of frames
        
        p5.push();
        p5.translate(x, y);
        if (flipX) {
            p5.scale(-1, 1);
        }
        p5.imageMode(p5.CENTER);
        p5.image(this.image, 0, 0, this.drawWidth, this.drawHeight, sx, sy, this.spriteWidth, this.spriteHeight);
        p5.pop();
    }
}