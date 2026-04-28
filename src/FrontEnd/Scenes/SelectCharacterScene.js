class SelectCharacterScene {
    constructor(sketch, backgroundImage) {
        this.sketch = sketch;
        this.backgroundImage = backgroundImage;
        this.currentSlide = 0;
        const cx = sketch.width / 2;
        this.slides = [{
            heroClass: "Archmage",
            text: "Lyra'Gotha the Archmage",
            description: 'A master of magical power, capable of unleashing spells to ' +
                'deal devastating blows to distant enemies. Features a skill book ' +
                'system, allowing players to freely combine skills from three different ' +
                'elements.',
            image: characterImages[2],
            narration: characterVoices[2],
            x: cx - 150,
            y: 150,
            width: 300,
            height: 400
        }, {
            heroClass: "Warrior",
            text: "Hugo 'Warrior' Fortis",
            description: 'A formidable warrior who can skilfully wield their ' +
                'weapons to tear their enemies to shreds. Features an arsenal ' +
                'system, allowing players to select different weapons to gain ' +
                'distinct skill sets.',
            image: characterImages[1],
            narration: characterVoices[1],
            x: cx - 150,
            y: 150,
            width: 300,
            height: 400
        }, {
            heroClass: "Architect",
            text: "Rion 'Architect' Steelgear",
            description: 'A craftsman skilled in architecture who can deploy ' +
                'or retrieve various types of turrets. He cannot move himself, ' +
                'but possesses extremely high health. When reduced to poverty, ' +
                'he will choose to take his own life. There is a limit to the ' +
                'number of turrets.',
            image: characterImages[0],
            narration: characterVoices[0],
            x: cx - 150,
            y: 150,
            width: 300,
            height: 400
        }];

        this.mainMenuButton = new Button(sketch, 20, 50, 160, 50, "Main Menu", () => {
           //stopping all narration tracks before returning to main menu
            this.stopAllNarration();
            //returning to main menu
            window.activeScene = new MenuScene(sketch, window.menuBackground);
        });

        this.nextButton = new Button(sketch, sketch.width - 300, sketch.height - 70, 280, 50, "Next Character", () => {
            //if this is not the last character then load next character, else do nothing
            if(this.currentSlide < this.slides.length - 1) {
                this.currentSlide++;
                this.playCurrentNarration();
            }
        });

        this.backButton = new Button(sketch, 20, sketch.height - 70, 280, 50, "Previous Character", () => {
            //if user clicks back when viewing first character do nothing, else load previous character
            if(this.currentSlide > 0) {
                this.currentSlide--;
                this.playCurrentNarration();
            } 
        })

        this.SelectCharacterButton = new Button(sketch, cx - 55, sketch.height - 130, 110, 50, "Select", () => {
            window.gameState.selectedCharacter = this.slides[this.currentSlide].heroClass;
            //stop character narration
            this.slides[this.currentSlide].narration.stop();
            window.GameController.startGame();
            window.activeScene = new MapOneScene(sketch, window.mapOneBackground);
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
        currentNarration.amp(0.9);

    }

    display() {
        if (this.backgroundImage && this.backgroundImage.complete && this.backgroundImage.naturalWidth > 0) {
            this.sketch.drawingContext.drawImage(this.backgroundImage, 0, 0, this.sketch.width, this.sketch.height);
        }
        //display buttons
        this.mainMenuButton.display();
        this.nextButton.display();
        this.backButton.display();
        this.SelectCharacterButton.display();

        // get current slide
        let slide = this.slides[this.currentSlide];

        // display image for current slide
        if (slide.image && slide.image.complete && slide.image.naturalWidth > 0) {
            this.sketch.drawingContext.drawImage(slide.image, slide.x, slide.y, slide.width, slide.height);
        }
        this.drawHeroDescription(slide);

        //displaying text for current slide
        this.sketch.fill('#FFFFFF');
        this.sketch.textAlign(this.sketch.CENTER, this.sketch.CENTER);
        this.sketch.textSize(40);
        this.sketch.textStyle(this.sketch.BOLD);
        this.sketch.text(slide.text, this.sketch.width/2, this.sketch.height - 160);
    }

    drawHeroDescription(slide) {
        const padding = 24;
        const gap = 40;
        const textX = slide.x + slide.width + gap;
        const textY = slide.y + 45;
        const textWidth = Math.max(220, this.sketch.width - textX - padding);
        const textHeight = slide.height - 90;

        this.sketch.noStroke();
        this.sketch.fill('#F5E6C8');
        this.sketch.textAlign(this.sketch.LEFT, this.sketch.TOP);
        this.sketch.textStyle(this.sketch.NORMAL);
        this.sketch.textSize(24);
        this.sketch.textLeading(34);
        this.sketch.text(slide.description, textX, textY, textWidth, textHeight);
    }

    mousePressed() {
        this.mainMenuButton.wasIClicked();
        this.nextButton.wasIClicked();
        this.backButton.wasIClicked();
        this.SelectCharacterButton.wasIClicked();
    }

    stopAllNarration() {
            //stopping all narration tracks before returning to main menu
            for(let i = 0; i < this.slides.length; i++) {
               if(this.slides[i].narration.isPlaying()) {
                this.slides[i].narration.stop();
               }
            }
    }
}
