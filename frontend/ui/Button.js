class Button {
    constructor(topLeftX, topLeftY, width, height, buttonText, onClick) {
        this.topLeftX = topLeftX;
        this.topLeftY = topLeftY;
        this.width = width;
        this.height = height;
        this.buttonText = buttonText;
        this.onClick = onClick;
    }

    display() {
        //creates button
        fill('brown');
        rect(this.topLeftX, this.topLeftY, this.width, this.height, 15);

        //inserts text into button
        fill(200);
        textAlign(CENTER, CENTER);
        textSize(15);
        let horizAlign = this.topLeftX + this.width / 2;
        let vertAlign = this.topLeftY + this.height / 2;
        text(this.buttonText, horizAlign, vertAlign);
    }

    wasIClicked() {
        //if this button was clicked then run its onClick function
        if(mouseX > this.topLeftX && mouseX < (this.topLeftX + this.width) &&
           mouseY > this.topLeftY && mouseY < (this.topLeftY + this.height)) {
            this.onClick();
        }
    }
}