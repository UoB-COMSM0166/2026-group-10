class MenuScene {
    constructor(sketch, backgroundImage) {
        this.sketch = sketch;
        this.backgroundImage = backgroundImage;
        
        const cx = sketch.width / 2;
        const cy = sketch.height / 2;
        
        this.startButton = new Button(sketch, cx - 100, cy - 50, 200, 75, "New Game", () => {
            activeScene = new SelectDifficultyScene(sketch, selectDifficultyBg);
        });
        this.introButton = new Button(sketch, cx - 100, cy + 50, 200, 50, 'Intro', () => {
            activeScene = new IntroScene(sketch, generalBackground);
        });
        this.instructionButton = new Button(sketch, cx - 100, cy + 125, 200, 50, 'Controls', () => {
            activeScene = new InstructionScene(sketch, generalBackground);
        });
        this.soundButton = new Button(sketch, cx - 100, cy + 200, 200, 50, 'Sound', () => {
            this.soundActive = !this.soundActive;
            //updating global sound variable (global variable is called isSound)
            window.gameState.settings.isSound = this.soundActive;
            if(!this.soundActive) {
                window.audioMessage = "Sound is switched off";
            } else {
                window.audioMessage = "Sound is switched on";
            }
            window.msgTimer = window.MESSAGE_DURATION;
        });
        this.musicButton = new Button(sketch, cx - 100, cy + 275, 200, 50, 'Music', () => {
         this.musicActive = !this.musicActive;
         window.gameState.settings.isMusic = this.musicActive;
            if(!this.musicActive) {
                if (window.menuMusic) window.menuMusic.pause();
                window.audioMessage = "Music is switched off";
            } else {
                if (window.menuMusic) {
                    window.menuMusic.loop();
                    window.menuMusic.play();
                }
                window.audioMessage = "Music is switched on";
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
        this.instructionButton.display();
        this.soundButton.display();
        this.musicButton.display();

        if(window.msgTimer > 0) {
            const msgCx = this.sketch.width / 2;
            const msgCy = this.sketch.height / 2 + 385;
            
            // draw UI box matching button style
            this.sketch.stroke('rgba(201, 162, 74, 0.35)');
            this.sketch.strokeWeight(1);
            this.sketch.fill('rgba(15, 12, 10, 0.8)');
            this.sketch.rect(msgCx - 250, msgCy - 35, 500, 70, 15);

            //display message to screen
            this.sketch.noStroke();
            this.sketch.fill('#F5E6C8');
            this.sketch.textAlign(this.sketch.CENTER, this.sketch.CENTER);
            this.sketch.textSize(30);
            this.sketch.textStyle(this.sketch.BOLD);
            this.sketch.text(window.audioMessage, msgCx, msgCy);
            window.msgTimer--;
        }
    }

    
    mousePressed() {
        this.startButton.wasIClicked();
        this.introButton.wasIClicked();
        this.instructionButton.wasIClicked();
        this.soundButton.wasIClicked();
        this.musicButton.wasIClicked();
    }
}