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
        if(this.isHover() == true) {
            this.sketch.fill(120, 60, 40);

        } else {
            this.sketch.fill('brown');
        }

        this.sketch.rect(this.topLeftX, this.topLeftY, this.width, this.height, 15);

        //inserts text into button
        this.sketch.fill(200);
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