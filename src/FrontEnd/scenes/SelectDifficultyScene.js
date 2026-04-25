class SelectDifficultyScene {
    constructor(sketch, backgroundImage) {
        this.sketch = sketch;
        this.backgroundImage = backgroundImage;
        const cx = sketch.width / 2;
        const cy = sketch.height / 2;
        
        this.easyButton = new Button(sketch, cx - 100, cy - 130, 200, 75, "Easy", () => {
            window.gameState.selectedDifficulty = "easy";
            window.activeScene = new SelectCharacterScene(sketch, window.generalBackground);
        });
        this.mediumButton = new Button(sketch, cx - 100, cy - 40, 200, 75, "Medium", () => {
            window.gameState.selectedDifficulty = "medium";
            window.activeScene = new SelectCharacterScene(sketch, window.generalBackground);
        });
        this.HardButton = new Button(sketch, cx - 100, cy + 50, 200, 75, "Hard", () => {
            window.gameState.selectedDifficulty = "hard";
            window.activeScene = new SelectCharacterScene(sketch, window.generalBackground);
        });
        this.backButton = new Button(sketch, 20, sketch.height - 70, 100, 50, "Back", () => {
            window.activeScene = new MenuScene(sketch, window.menuBackground);
        });
     }

     display() {
        if (this.backgroundImage && this.backgroundImage.complete && this.backgroundImage.naturalWidth > 0) {
            this.sketch.drawingContext.drawImage(this.backgroundImage, 0, 0, this.sketch.width, this.sketch.height);
        }
        this.easyButton.display();
        this.mediumButton.display();
        this.HardButton.display();
        this.backButton.display();
     }

     mousePressed() {
        this.easyButton.wasIClicked();
        this.mediumButton.wasIClicked();
        this.HardButton.wasIClicked();
        this.backButton.wasIClicked();
     }


    }