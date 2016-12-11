BunnyDefender.StartMenu = function(game){
    this.startBG;
    this.startPrompt;
    this.ding;
}

BunnyDefender.StartMenu.prototype = {
    
    create(){
        this.ding = this.add.audio('select_audio');
        
        startBG = this.add.image(0,0,'titlescreen');
        startBG.inputEnabled = true;
        startBG.events.onInputDown.addOnce(this.startGame, this);
        
        startPrompt = this.add.bitmapText(this.world.centerX-155, this.world.centerY+180, 'eightbitwonder', 'Touch to Stater!', 24);
    },
    
    startGame(pointer){
        this.ding.play();
        this.state.start('Game');
    }
}