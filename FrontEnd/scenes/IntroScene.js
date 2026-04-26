class IntroScene {
    constructor(sketch, backgroundImage) {
        this.sketch = sketch;
        this.backgroundImage = backgroundImage;
        this.currentSlide = 0;
        this.imageMovementSpeed = 0.014;  
        this.imageMovementRange = 20;    
        const cx = sketch.width / 2;
        this.slides = [
            {
                text: `Deep within a forest near Cinder, lives a tree that is the source of life`,
                image: introImages[0],
                narration: introVoices[0],
                x: cx - 200,
                y: 200,
                width: 500,
                height: 420
            }, {
                text: `recently, an army of undead creatures has awakened from the earth...`,
                image: introImages[1],
                narration: introVoices[1],
                x: cx - 200,
                y: 200,
                width: 500,
                height: 420
            }, {
                text: `the evil army want to destroy the precious tree...`,
                image: introImages[2],
                narration: introVoices[2],
                x: cx - 200,
                y: 200,
                width: 500,
                height: 420
            }, {
                text: `only you can stop them and protect the ancient tree...`,
                image: introImages[3],
                narration: introVoices[3],
                x: cx - 200,
                y: 200,
                width: 500,
                height: 420
            }
        ]

        this.mainMenuButton = new Button(sketch, 20, 50, 160, 50, "Main Menu", () => {
            //stopping intro music before returning to main menu
            if(introMusic.isPlaying() == true) {
                introMusic.stop();
            }
            //starting main menu music
            if(gameState.settings.isMusic == true) {
                menuMusic.amp(0.15);
                menuMusic.loop();
                menuMusic.play();
            }
            //stopping all narration tracks before returning to main menu
            for(let i = 0; i < this.slides.length; i++) {
               if(this.slides[i].narration.isPlaying()) {
                console.log("last before clicking to main menu was" + this.slides[i].text);
                this.slides[i].narration.stop();
               }
            }
            //returning to main menu
            window.activeScene = new MenuScene(sketch, window.menuBackground);
        });

        this.nextButton = new Button(sketch, sketch.width - 170, sketch.height - 70, 150, 50, "Next", () => {
            //if this is not last slide then move to next slide
            if(this.currentSlide < this.slides.length - 1) {
                this.currentSlide++;
                this.playCurrentNarration();
            } else {
                this.stopAllNarration();
                //if this is last slide then turn off intro_music and narration before returning to main menu
                if(introMusic.isPlaying()) {
                    introMusic.stop();
                }
                //before returning to main menu turn on menu music if global varialbe is true
                if(gameState.settings.isMusic == true) {
                    menuMusic.amp(0.15);
                    menuMusic.loop();
                    menuMusic.play();
            }
                window.activeScene = new MenuScene(sketch, window.menuBackground);
            }
        });

        this.backButton = new Button(sketch, 20, sketch.height - 70, 150, 50, "Back", () => {
            //if user clicks back on first slide, return to main menu, else go to previous slide
            if(this.currentSlide <= 0) {
                if(introMusic.isPlaying()) {
                    introMusic.stop();
                }
                if(gameState.settings.isMusic == true) {
                    menuMusic.amp(0.15);
                    menuMusic.loop();
                    menuMusic.play();
                }
                //stopping all narration tracks before returning to main menu 
               for(let i = 0; i < this.slides.length; i++) {
                  if(this.slides[i].narration.isPlaying()) {
                     this.slides[i].narration.stop();
                    }
                }
                window.activeScene = new MenuScene(sketch, window.menuBackground);
            } else {
                this.currentSlide--;
                this.playCurrentNarration();
            }
        })

        if(menuMusic.isPlaying() == true) {
            menuMusic.stop();
        }

        if((introMusic.isPlaying() == false) && (gameState.settings.isMusic == true)) {
            introMusic.amp(0.15);
            introMusic.loop();
            introMusic.play();
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
        currentNarration.amp(0.55);

    }

    display() {
        if (this.backgroundImage && this.backgroundImage.complete && this.backgroundImage.naturalWidth > 0) {
            this.sketch.drawingContext.drawImage(this.backgroundImage, 0, 0, this.sketch.width, this.sketch.height);
        }
        this.mainMenuButton.display();
        this.nextButton.display();
        this.backButton.display();

        // get current slide
        let slide = this.slides[this.currentSlide];

        // calculating side to side movement of image
        let bounceX = slide.x + this.sketch.sin(this.sketch.frameCount * this.imageMovementSpeed) * this.imageMovementRange;

        // displaying the image
        if (slide.image && slide.image.complete && slide.image.naturalWidth > 0) {
            this.sketch.drawingContext.drawImage(slide.image, bounceX, slide.y, slide.width, slide.height);
        }

        // making the text bounce up and down
        let bounceRate = 0.02;
        let bounceHeight = 10;
        let bounceY = this.sketch.height/1.3 + this.sketch.sin(this.sketch.frameCount * bounceRate) * bounceHeight;
        
        //making a shaded background for the text to increase text readability
        this.sketch.fill(0, 120);
        this.sketch.rect(0, bounceY - 30, this.sketch.width, 80);
        //displaying the text
        this.sketch.fill(255, 255, 255, 220);
        this.sketch.textAlign(this.sketch.CENTER, this.sketch.CENTER);
        this.sketch.textSize(40);

        

        this.sketch.text(slide.text, this.sketch.width/2, bounceY);
                
        //displaying slide count in top right of screen
        this.displaySlideNumber();

    }

    mousePressed() {
        this.mainMenuButton.wasIClicked();
        this.nextButton.wasIClicked();
        this.backButton.wasIClicked();
    }

    stopAllNarration() {
        //stopping all narration tracks before returning to main menu
        for(let i = 0; i < this.slides.length; i++) {
               if(this.slides[i].narration.isPlaying()) {
                this.slides[i].narration.stop();
               }
            }
    }

    displaySlideNumber() {
        // push(); // isolate state
        // fill(255);
        // textSize(20);
        // textAlign(LEFT);
        // let slideNum = this.currentSlide + 1;
        // let totalSlides = this.slides.length;
        // text(`${slideNum} / ${totalSlides}`, 1150, 35);
        // console.log("I ran!");
        // pop();
        this.sketch.push();
        this.sketch.fill(255);
        this.sketch.noStroke();
        this.sketch.textSize(20);
        this.sketch.textAlign(this.sketch.LEFT);
        let slideNum = this.currentSlide + 1;
        let totalSlides = this.slides.length;
        this.sketch.text(`${slideNum} / ${totalSlides}`, this.sketch.width - 130, 35);
        this.sketch.pop();
    }
}