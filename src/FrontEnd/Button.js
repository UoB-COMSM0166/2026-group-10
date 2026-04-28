class Button {
    constructor(sketch, topLeftX, topLeftY, width, height, buttonText, onClick) {
        this.sketch = sketch;
        this.topLeftX = topLeftX;
        this.topLeftY = topLeftY;
        this.width = width;
        this.height = height;
        this.buttonText = buttonText;
        this.onClick = onClick;
    }

    display() {

        //creating button
        this.sketch.strokeWeight(1);
        if(this.isHover() == true) {
            if (this.sketch.mouseIsPressed) {
                this.sketch.fill('rgba(10, 8, 6, 0.9)'); // Active
            } else {
                this.sketch.fill('rgba(30, 24, 20, 0.85)'); // Hover
            }
            this.sketch.stroke('rgba(224, 188, 99, 0.6)');
            this.sketch.drawingContext.shadowBlur = 12;
            this.sketch.drawingContext.shadowColor = 'rgba(201, 162, 74, 0.25)';
        } else {
            this.sketch.fill('rgba(15, 12, 10, 0.8)'); // Base
            this.sketch.stroke('rgba(201, 162, 74, 0.35)');
            this.sketch.drawingContext.shadowBlur = 0;
        }

        this.sketch.rect(this.topLeftX, this.topLeftY, this.width, this.height, 15);

        //inserts text into button
        this.sketch.drawingContext.shadowBlur = 0; // reset shadow for text
        this.sketch.noStroke();
        this.sketch.fill('#F5E6C8');
        this.sketch.textAlign(this.sketch.CENTER, this.sketch.CENTER);
        this.sketch.textSize(25);
        this.sketch.textStyle(this.sketch.BOLD);
        let horizAlign = this.topLeftX + this.width / 2;
        let vertAlign = this.topLeftY + this.height / 2;
        this.sketch.text(this.buttonText, horizAlign, vertAlign);


    }

    wasIClicked() {
        //if this button was clicked then run its onClick function
        if(this.sketch.mouseX > this.topLeftX && this.sketch.mouseX < (this.topLeftX + this.width) &&
           this.sketch.mouseY > this.topLeftY && this.sketch.mouseY < (this.topLeftY + this.height)) {
            playClickNoise();
            //runs button's callback
            this.onClick();
        }
    }

    //this function detects if the user is hovering over the button
    isHover() {
        let isHover = false;
        //checking to see if user's mouse is hovering over button
        if(this.sketch.mouseX > this.topLeftX && this.sketch.mouseX < this.topLeftX + this.width &&
           this.sketch.mouseY > this.topLeftY && this.sketch.mouseY < this.topLeftY + this.height
        ) {
            isHover = true;
        }
        return isHover;
    }

}