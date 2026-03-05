class SelectCharacterScene {
    constructor(backgroundImage) {
        this.backgroundImage = backgroundImage;
        this.currentSlide = 0;
        this.slides = [{
            text: "Elf Ranger",
            image: characterImages[0],
            narration: characterVoices[0],
            x: width / 2 - 125,
            y: 100,
            width: 300,
            height: 400
        }, {
            text: "Human Warrior",
            image: characterImages[1],
            narration: characterVoices[1],
            x: width / 2 - 125,
            y: 100,
            width: 300,
            height: 400
        }, {
            text: "Dracthyr Mage",
            image: characterImages[2],
            narration: characterVoices[2],
            x: width / 2 - 125,
            y: 100,
            width: 300,
            height: 400
        }];

        this.mainMenuButton = new Button(20, 50, 130, 50, "Main Menu", () => {
           //stopping all narration tracks before returning to main menu
            for(let i = 0; i < this.slides.length; i++) {
               if(this.slides[i].narration.isPlaying()) {
                this.slides[i].narration.stop();
               }
            }
            //returning to main menu
            activeScene = new MenuScene(menuBackground);
        });

        this.nextButton = new Button(1050, 650, 200, 50, "Next Character", () => {
            //if this is not the last character then load next character, else do nothing
            if(this.currentSlide < this.slides.length - 1) {
                this.currentSlide++;
                this.playCurrentNarration();
            } else {
                //turn off intro_music before returning to main menu
                // if(introMusic.isPlaying()) {
                //     introMusic.stop();
                // }
                //before returning to main menu turn on menu music if global varialbe is true
                // if(isMusic == true) {
                // menuMusic.loop();
                // menuMusic.setVolume(0.45);
            //}
            }
        });

        this.backButton = new Button(40, 650, 200, 50, "Previous Character", () => {
            //if user clicks back when viewing first character do nothing, else load previous character
            if(this.currentSlide > 0) {
                this.currentSlide--;
                this.playCurrentNarration();
            } 
        })

        this.SelectCharacterButton = new Button(width / 2 - 30, 590, 110, 50, "SELECT", () => {
            activeScene = new MapOneScene(mapOneBackground);
        });

        this.playCurrentNarration();
    }

    
    playCurrentNarration() {
        //making sure all narration is stopped
        for(let i = 0; i < this.slides.length; i++) {
            if(this.slides[i].narration.isPlaying()) {
                this.slides[i].narration.stop();
            }
        }
        //then we start the new, current narration track
        let currentNarration = this.slides[this.currentSlide].narration;
        currentNarration.play();
        currentNarration.setVolume(0.9);

    }

    display() {
        image(this.backgroundImage, 0, 0, width, height);
        //display buttons
        this.mainMenuButton.display();
        this.nextButton.display();
        this.backButton.display();
        this.SelectCharacterButton.display();

        // get current slide
        let slide = this.slides[this.currentSlide];

        // display image for current slide
        image(slide.image, slide.x, slide.y, slide.width, slide.height);

        //displaying text for current slide
        fill('orange');
        textAlign(CENTER, CENTER);
        textSize(40);
        text(slide.text, width/2, 560);
    }

    mousePressed() {
        this.mainMenuButton.wasIClicked();
        this.nextButton.wasIClicked();
        this.backButton.wasIClicked();
        this.SelectCharacterButton.wasIClicked();
    }
}