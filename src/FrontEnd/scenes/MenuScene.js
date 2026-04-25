class MenuScene {
    constructor(sketch, backgroundImage) {
        this.sketch = sketch;
        this.backgroundImage = backgroundImage;
        
        const cx = sketch.width / 2;
        const cy = sketch.height / 2;
        
        this.startButton = new Button(sketch, cx - 100, cy - 50, 200, 75, "Start Game", () => {
            activeScene = new SelectDifficultyScene(sketch, selectDifficultyBg);
        });
        this.introButton = new Button(sketch, cx - 100, cy + 40, 200, 50, 'Intro', () => {
            activeScene = new IntroScene(sketch, generalBackground);
        });
        this.soundButton = new Button(sketch, cx - 100, cy + 105, 50, 50, 'S', () => {
            this.soundActive = !this.soundActive;
            //updating global sound variable (global variable is called isSound)
            window.gameState.settings.isSound = this.soundActive;
            if(this.soundActive == false) {
                window.audioMessage = "Sound is switched off!";
            } else {
                window.audioMessage = "Sound is switched on!";
            }
            window.msgTimer = window.MESSAGE_DURATION;
        });
        this.musicButton = new Button(sketch, cx + 50, cy + 105, 50, 50, 'M', () => {
         this.musicActive = !this.musicActive;
         window.gameState.settings.isMusic = this.musicActive;
            if(this.musicActive == false) {
                if (window.menuMusic) window.menuMusic.pause();
                window.audioMessage = "Music is switched off!";
            } else {
                if (window.menuMusic) {
                    window.menuMusic.loop();
                    window.menuMusic.play();
                }
                window.audioMessage = "Music is switched on!";
            }
            window.msgTimer = window.MESSAGE_DURATION;
        });
        this.soundActive = window.gameState.settings.isSound;
        this.musicActive = window.gameState.settings.isMusic;
    }

    display() {
        if (window.font) {
            this.sketch.textFont(window.font);
        } else {
            this.sketch.textFont('sans-serif');
        }
        
        if (this.backgroundImage && this.backgroundImage.complete && this.backgroundImage.naturalWidth > 0) {
            this.sketch.drawingContext.drawImage(this.backgroundImage, 0, 0, this.sketch.width, this.sketch.height);
        }

        //displaying the buttons
        this.startButton.display();
        this.introButton.display();
        this.soundButton.display();
        this.musicButton.display();

        if(window.msgTimer > 0) {
            //display message to screen
            this.sketch.fill('orange');
            this.sketch.textAlign(this.sketch.CENTER, this.sketch.CENTER);
            this.sketch.textSize(40);
            this.sketch.text(window.audioMessage, this.sketch.width / 2, 100);
            window.msgTimer--;
        }
    }

    
    mousePressed() {
        this.startButton.wasIClicked();
        this.introButton.wasIClicked();
        this.soundButton.wasIClicked();
        this.musicButton.wasIClicked();
    }
}