class MenuScene {
    constructor(backgroundImage) {
        this.backgroundImage = backgroundImage;
        this.startButton = new Button(515, 400, 200, 75, "Start Game", () => {
            activeScene = new SelectDifficultyScene(selectDifficultyBg);
        });
        this.introButton = new Button(515, 490, 200, 50, 'Intro', () => {
            activeScene = new IntroScene(generalBackground);
        });
        this.soundButton = new Button(520, 555, 50, 50, 'S', () => {
            this.soundActive = !this.soundActive;
            //updating global sound variable (global variable is called isSound)
            gameState.settings.isSound = this.soundActive;
            if(this.soundActive == false) {
                audioMessage = "Sound is switched off!";
            } else {
                audioMessage = "Sound is switched on!";
            }
            msgTimer = MESSAGE_DURATION;
        });
        this.musicButton = new Button(650, 555, 50, 50, 'M', () => {
         this.musicActive = !this.musicActive;
         gameState.settings.isMusic = this.musicActive;
            if(this.musicActive == false) {
                menuMusic.pause();
                audioMessage = "Music is switched off!";
            } else {
                menuMusic.play();
                audioMessage = "Music is switched on!";
            }
            msgTimer = MESSAGE_DURATION;
        });
        this.soundActive = gameState.settings.isSound;
        this.musicActive = gameState.settings.isMusic;
    }

    display() {
        textFont(font);
        image(this.backgroundImage, 0, 0, width, height);

        //displaying the buttons
        this.startButton.display();
        this.introButton.display();
        this.soundButton.display();
        this.musicButton.display();

        if(msgTimer > 0) {
            let topLeftX = width / 2;
            let topLeftY = 100;

            //display message to screen
            fill('orange');
            textAlign(CENTER, CENTER);
            textSize(40);
            text(audioMessage, topLeftX, topLeftY);
            msgTimer--;
        }
    }

    
    mousePressed() {
        this.startButton.wasIClicked();
        this.introButton.wasIClicked();
        this.soundButton.wasIClicked();
        this.musicButton.wasIClicked();
    }
}