class IntroScene {
    constructor(backgroundImage) {
        this.backgroundImage = backgroundImage;
        this.currentSlide = 0;
        this.imageMovementSpeed = 0.014;  
        this.imageMovementRange = 20;    
        this.slides = [
            {
                text: `On the edge of a forest was a town called Cinder, where the people lived happily...`,
                image: introImages[0],
                narration: introVoices[0],
                x: 200,
                y: 200,
                width: 400,
                height: 300
            }, {
                text: `But one day, an evil, tree released an army of cruel creatures to attack Cinder...`,
                image: introImages[1],
                narration: introVoices[1],
                x: 500,
                y: 200,
                width: 400,
                height: 300
            }, {
                text: `the evil army is fast approaching the town...`,
                image: introImages[2],
                narration: introVoices[2],
                x: 200,
                y: 200,
                width: 400,
                height: 300
            }, {
                text: `only you can stop them and protect the good people of Cinder...`,
                image: introImages[3],
                narration: introVoices[3],
                x: 350,
                y: 200,
                width: 400,
                height: 300
            }
        ]

        this.mainMenuButton = new Button(20, 50, 130, 50, "Main Menu", () => {
            //stopping intro music before returning to main menu
            if(introMusic.isPlaying() == true) {
                introMusic.stop();
            }
            //starting main menu music
            if(isMusic == true) {
                menuMusic.loop();
                menuMusic.setVolume(0.45);
            }
            //stopping all narration tracks before returning to main menu
            for(let i = 0; i < this.slides.length; i++) {
               if(this.slides[i].narration.isPlaying()) {
                this.slides[i].narration.stop();
               }
            }
            //returning to main menu
            activeScene = new MenuScene(menuBackground);
        });

        this.nextButton = new Button(1100, 650, 150, 50, "Next", () => {
            //if this is last slide then return to main menu
            if(this.currentSlide < this.slides.length - 1) {
                this.currentSlide++;
                this.playCurrentNarration();
            } else {
                //turn off intro_music before returning to main menu
                if(introMusic.isPlaying()) {
                    introMusic.stop();
                }
                //before returning to main menu turn on menu music if global varialbe is true
                if(isMusic == true) {
                menuMusic.loop();
                menuMusic.setVolume(0.45);
            }
                activeScene = new MenuScene(menuBackground);
            }
        });

        this.backButton = new Button(20, 650, 150, 50, "Back", () => {
            //if user clicks back on first slide, return to main menu, else go to previous slide
            if(this.currentSlide <= 0) {
                if(introMusic.isPlaying()) {
                    introMusic.stop();
                }
                if(isMusic == true) {
                    menuMusic.loop();
                    menuMusic.setVolume(0.45);
                }
                //stopping all narration tracks before returning to main menu 
               for(let i = 0; i < this.slides.length; i++) {
                  if(this.slides[i].narration.isPlaying()) {
                     this.slides[i].narration.stop();
                    }
                }
                activeScene = new MenuScene(menuBackground);
            } else {
                this.currentSlide--;
                this.playCurrentNarration();
            }
        })

        if(menuMusic.isPlaying() == true) {
            menuMusic.stop();
        }

        if((introMusic.isPlaying() == false) && (isMusic == true)) {
            introMusic.loop();
            introMusic.setVolume(0.45);
        }

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
        this.mainMenuButton.display();
        this.nextButton.display();
        this.backButton.display();

        // get current slide
        let slide = this.slides[this.currentSlide];

        // calculating side to side movement of image
        let bounceX = slide.x + sin(frameCount * this.imageMovementSpeed) * this.imageMovementRange;

        // displaying the image
        image(slide.image, bounceX, slide.y, slide.width, slide.height);

        //displaying the text
        fill('orange');
        textAlign(CENTER, CENTER);
        textSize(40);

    // making the text bounce up and down
    let bounceRate = 0.02;
    let bounceHeight = 10;
    let bounceY = height/1.3 + sin(frameCount * bounceRate) * bounceHeight;

    text(slide.text, width/2, bounceY);


    }

    mousePressed() {
        this.mainMenuButton.wasIClicked();
        this.nextButton.wasIClicked();
        this.backButton.wasIClicked();
    }
}