class LoadingScene {
    constructor(sketch) {
        this.sketch = sketch;
        this.frames = 0;
        // Minimum number of frames to show the loading screen (e.g., 120 frames = ~2 seconds at 60 FPS)
        this.minLoadingFrames = 120; 
        
        // Loading bar configuration
        this.numBlocks = 20;
        this.blockSize = 16;
        this.blockGap = 6;
    }

    display() {
        this.sketch.background('#09101C');
        this.frames++;

        const cx = this.sketch.width / 2;
        const cy = this.sketch.height / 2;
        
        // Bar position
        const barX = cx - 35; 
        const barY = cy + 200; 

        // Calculate progress (0.0 to 1.0)
        let progress = this.sketch.constrain(this.frames / this.minLoadingFrames, 0, 1);
        let percentage = Math.floor(progress * 100);

        // Total width of the bar to ensure perfectly centered alignment
        const totalWidth = (this.numBlocks * this.blockSize) + ((this.numBlocks - 1) * this.blockGap);
        const startX = barX - totalWidth / 2;

        this.sketch.push();
        this.sketch.noStroke();

        // 1. Draw horizontal loading bar blocks
        for (let i = 0; i < this.numBlocks; i++) {
            let blockX = startX + i * (this.blockSize + this.blockGap);
            let fillThreshold = i / this.numBlocks;

            if (progress > fillThreshold) {
                this.sketch.fill(255, 215, 0); // Gold/yellow for filled blocks
            } else {
                this.sketch.fill(255, 215, 0, 50); // Faded gold for unfilled blocks (transparent)
            }
            this.sketch.rect(blockX, barY, this.blockSize, this.blockSize, 2); // Slight 2px border radius
        }

        // 2. Draw percentage text to the right of the loading bar
        this.sketch.fill(255, 215, 0);
        this.sketch.textAlign(this.sketch.LEFT, this.sketch.CENTER);
        if (window.font) {
            this.sketch.textFont(window.font);
        }
        this.sketch.textSize(24);
        this.sketch.text(`${percentage}%`, startX + totalWidth + 20, barY + this.blockSize / 2);

        // 3. Keep the pulsing text effect centered
        let alpha = this.sketch.map(this.sketch.sin(this.frames * 0.05), -1, 1, 100, 255);
        this.sketch.fill(255, 255, 255, alpha);
        this.sketch.textAlign(this.sketch.CENTER, this.sketch.CENTER);
        this.sketch.textSize(60);
        this.sketch.text("An Epic Adventure Awaits...", cx+20, cy);

        this.sketch.pop();

        // 3. Transition logic
        let bgLoaded = window.menuBackground && window.menuBackground.complete && window.menuBackground.naturalWidth > 0;
        if (this.frames > this.minLoadingFrames && bgLoaded) {
            window.activeScene = new MenuScene(this.sketch, window.menuBackground);
        }
    }

    mousePressed() {
        // Optional: Allow the user to skip the animation early if assets are loaded
    }
}