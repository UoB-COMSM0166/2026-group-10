class SelectDifficultyScene {
    constructor(backgroundImage) {
        this.backgroundImage = backgroundImage;
        this.easyButton = new Button(515, 230, 200, 75, "Easy", () => {
            console.log("easy button clicked!");
            activeScene = new MapOneScene(mapOneBackground);
        });
        this.mediumButton = new Button(515, 320, 200, 75, "Medium", () => {
            activeScene = new MapOneScene(mapOneBackground);
        });
        this.HardButton = new Button(515, 410, 200, 75, "Hard", () => {
            activeScene = new MapOneScene(mapOneBackground);
        });
     }

     display() {
        image(this.backgroundImage, 0, 0, width, height);
        this.easyButton.display();
        this.mediumButton.display();
        this.HardButton.display();
     }

     mousePressed() {
        this.easyButton.wasIClicked();
        this.mediumButton.wasIClicked();
        this.HardButton.wasIClicked();
     }


    }