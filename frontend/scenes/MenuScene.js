class MenuScene {
    constructor(backgroundImage) {
        this.backgroundImage = backgroundImage;
        this.startButton = new Button(515, 400, 200, 75, "Start Game", () => {
            activeScene = new SelectDifficultyScene(this.backgroundImage);
        });
        this.introButton = new Button(515, 490, 200, 50, 'Intro', () => {
            console.log("Intro button clicked!");
        });
        this.soundButton = new Button(520, 555, 50, 50, 'S', () => {
            this.isSoundOn = !this.isSoundOn;
            audioMessage = "Sound is switched on!";
            if(!this.isSoundOn) {
                audioMessage = "Sound is switched off!";
            }
            msgTimer = MESSAGE_DURATION;
        });
        this.musicButton = new Button(650, 555, 50, 50, 'M', () => {
         this.isMusicOn = !this.isMusicOn;
            audioMessage = "Music is switched on!";
            if(!this.isMusicOn) {
                audioMessage = "Music is switched off!";
            }
            msgTimer = MESSAGE_DURATION;
        });
        this.isSoundOn = true;
        this.isMusicOn = true;
    }

    display() {
        image(this.backgroundImage, 0, 0, width, height);

        //displaying the title
        fill('orange');
        textAlign(CENTER, CENTER);
        textSize(76);
        text("Gates of Cinder!", width / 2, 300);

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