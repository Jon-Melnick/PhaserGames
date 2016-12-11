BunnyDefender.Game = function(game){
    this.totalBunnies;
    this.bunnygroup;
    
    this.totalSpacerocks;
    this.spacerockgroup;
    
    this.burst;
    
    this.gameOver;
    
    this.countdown;
    
    this.overmessage;
    this.secondsElapsed;
    this.timer;
    
    this.music;
    this.ouch;
    this.boom;
    this.ding;
};

BunnyDefender.Game.prototype = {
    
    create(){
        this.gameOver = false;
        this.secondsElapsed = 0;
        this.timer = this.time.create(false);
        this.timer.loop(1000, this.updateSeconds, this);
        this.totalBunnies = 20;
        this.totalSpacerocks = 13;
        
        this.music = this.add.audio('game_audio');
        this.music.play('', 0, 0.3, true);
        this.ouch = this.add.audio('hurt_audio');
        this.boom = this.add.audio('explosion_audio');
        this.ding = this.add.audio('select_audio');
        
        this.buildWorld();
    },
    
    
    buildWorld(){
        this.add.image(0, 0, 'sky');
        this.add.image(0, 800, 'hill');
        this.buildBunnies();
        this.buildSpacerocks();
        this.buildEmitter();
        this.countdown = this.add.bitmapText(10,10,'eightbitwonder', 'Bunnies left ' + this.totalBunnies, 20);
        this.timer.start();
    },
    
    updateSeconds(){
      this.secondsElapsed++  
    },
    
    buildBunnies(){
        this.bunnygroup = this.add.group();
        this.bunnygroup.enableBody = true;
        for(let i=0; i<this.totalBunnies; i++){
            let b = this.bunnygroup.create(this.rnd.integerInRange(-10, this.world.width-50), this.rnd.integerInRange(this.world.height-180, this.world.height-60), 'bunny', 'Bunny0000');
            b.anchor.setTo(0.5,0.5);
            b.body.moves = false;
            b.animations.add('Rest', this.game.math.numberArray(1,58));
            b.animations.add('Walk', this.game.math.numberArray(68,107));
            b.animations.play('Rest', 24, true);
            
            this.assignBunnyMovement(b);
        }
    },
    
    assignBunnyMovement(b){
        bposition = Math.floor(this.rnd.realInRange(50, this.world.width-50));
        bdelay = this.rnd.integerInRange(2000,6000);
        if(bposition < b.x){
            b.scale.x = 1;
        } else {
            b.scale.x = -1;
        }
        t = this.add.tween(b).to({x:bposition}, 3500, Phaser.Easing.Quadratic.InOut, true, bdelay);
        t.onStart.add(this.startBunny, this);
        t.onComplete.add(this.stopBunny, this);
    },
    
    startBunny(b){
        b.animations.stop('Rest');
        b.animations.play('Walk', 24, true);
    },
    
    stopBunny(b){
        b.animations.stop('Walk');
        b.animations.play('Rest', 24, true);
        this.assignBunnyMovement(b);
    },
    
    buildSpacerocks(){
        this.spacerockgroup = this.add.group();
        for(let i=0; i<this.totalSpacerocks; i++){
            let r = this.spacerockgroup.create(this.rnd.integerInRange(0, this.world.width), this.rnd.realInRange(-1500, 0), 'spacerock', 'SpaceRock0000');
            let scale = this.rnd.realInRange(0.3, 1.0);
            r.scale.x = scale;
            r.scale.y = scale;
            this.physics.enable(r, Phaser.Physics.ARCADE);
            r.enableBody = true;
            r.body.velocity.y = this.rnd.integerInRange(200, 400);
            r.animations.add('Fall');
            r.animations.play('Fall', 24, true);
            r.checkWorldBounds = true;
            r.events.onOutOfBounds.add(this.resetRock, this);
        }
    },
    
    resetRock(r){
        if(r.y > this.world.height){
            this.respawnRock(r);
        }
    },
    
    respawnRock(r){
        if(this.gameOver === true) return;
        r.reset(this.rnd.integerInRange(0, this.world.width), this.rnd.realInRange(-1500, 0));
        r.body.velocity.y = this.rnd.integerInRange(200,400);
    },
    
    buildEmitter(){
        this.burst = this.add.emitter(0,0,80);
        this.burst.minParticleScale = 0.3;
        this.burst.maxParticleScale = 1.2;
        this.burst.minParticleSpeed.setTo(-30,30);
        this.burst.maxParticleSpeed.setTo(30,-30);
        this.burst.makeParticles('explosion');
        this.input.onDown.add(this.fireburst, this);
    },
    
    fireburst(pointer){
        if(this.gameOver === true) return;
        this.boom.play();
        this.boom.volume = 0.2;
        this.burst.emitX = pointer.x;
        this.burst.emitY = pointer.y;
        this.burst.start(true, 2000, null, 20);
    },
    
    burstCollision(r, b){
        this.respawnRock(r);
    },
    
    bunnyCollision(r, b){
        if(b.exists){
            this.ouch.play();
            this.respawnRock(r);
            this.makeGhost(b);
            b.kill();
            this.totalBunnies--;
            this.checkBunniesLeft();
        }
    },
    
    friendlyFire(b, e){
      if(b.exists){
          this.ouch.play();
          this.makeGhost(b);
          b.kill();
          this.totalBunnies--;
          this.checkBunniesLeft();
      }  
    },
    
    makeGhost(b){
        let bunnyGhost = this.add.sprite(b.x-20, b.y-180, 'ghost');
        bunnyGhost.anchor.setTo(0.5,0.5);
        bunnyGhost.scale.x = b.scale.x;
        this.physics.enable(bunnyGhost, Phaser.Physics. ARCADE);
        bunnyGhost.enableBody = true;
        bunnyGhost.checkWorldBounds = true;
        bunnyGhost.body.velocity.y = -800;
    },
    
    checkBunniesLeft(){
        if(this.totalBunnies <= 0){
            this.gameOver = true;
            this.music.stop();
            this.countdown.setText('Bunnies left 0')
            this.overmessage = this.add.bitmapText(this.world.centerX-180, this.world.centerY-40, 'eightbitwonder', 'Game Over\n\n' + this.secondsElapsed + ' seconds', 42);
            this.overmessage.align = 'center';
            this.overmessage.inputEnabled = true;
            this.overmessage.events.onInputDown.addOnce(this.quitGame, this);
        } else {
            this.countdown.setText('Bunnies left '+this.totalBunnies)
        }
    },
    
    quitGame(pointer){
        this.ding.play();
        this.state.start('StartMenu');
    },
    
    update(){
        this.physics.arcade.overlap(this.spacerockgroup, this.burst, this.burstCollision, null, this)
        this.physics.arcade.overlap(this.spacerockgroup, this.bunnygroup, this.bunnyCollision, null, this)
        this.physics.arcade.overlap(this.bunnygroup, this.burst, this.friendlyFire, null, this)
    }
}