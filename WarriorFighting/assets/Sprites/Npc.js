cc.Class({
    extends: cc.Component,

    properties: {
        body: cc.Node,
        jumpHeight: 0,
        jumpDuration: 0,
        jumpDistance: 0,
        maxMana: 0,
        manaRecoverSpeed: 0,
        manaUse: 0,
        manaBar: cc.ProgressBar,
        manaLabel: cc.Label,
        launchButton: cc.Prefab,
    },

    // use this for initialization
    onLoad: function () {
        var jumpAction = this.setJumpAction();
        this.mana = 0;
        this._pool = new cc.NodePool('PoolHandler');
        this.node.runAction(jumpAction);
    },
    
    setJumpActionY: function(){
        var jumpUp = cc.moveBy(this.jumpDuration, cc.p(0,this.jumpHeight)).easing(cc.easeCubicActionOut());
        var jumpDown = cc.moveBy(this.jumpDuration, cc.p(0,-this.jumpHeight)).easing(cc.easeCubicActionIn());
        
        return cc.sequence(jumpUp, jumpDown);
    },
    
    setJumpAction: function(){
        var jumpRight = cc.moveBy(this.jumpDuration * 2, cc.p(this.jumpDistance, 0));
        var jumpLeft = cc.moveBy(this.jumpDuration * 2, cc.p(-this.jumpDistance, 0));
        
        var jumpActionY = this.setJumpActionY();
        
        var self = this;
        
        return cc.repeatForever(
            cc.sequence(
                cc.spawn(jumpRight,jumpActionY,cc.callFunc(function(){
                    self.body.scaleX = 1;
                    self.body.rotation = 30;
                })),
                cc.spawn(jumpLeft,jumpActionY,cc.callFunc(function(){
                    self.body.scaleX = -1;
                    self.body.rotation = -30;
                }))
            )
        );
    },
    
    generateNode: function () {
        var monster = this._pool.get();
        if (!monster) {
            monster = cc.instantiate(this.launchButton);
        
            // Add pool handler component which will control the touch event
            monster.addComponent('PoolHandler');
        }
        monster.x = this.node.x;
        monster.y = this.node.y;
        
        var dx = -monster.getComponent('Fire').flyDistance;
        var dy = 0;
        
        console.log(dx, dy);
        
        monster.runAction(cc.sequence(
            cc.moveBy(monster.getComponent('Fire').flyDistance / monster.getComponent('Fire').flySpeed, dx, dy),
            cc.callFunc(this.removeNode, this, monster)
        ));
        
        this.node.parent.addChild(monster);
    },
    
    removeNode: function (sender, monster) {
        this._pool.put(monster);
    },

    // called every frame, uncomment this function to activate update callback
    update: function (dt) {
        if (this.mana < this.maxMana){
            this.mana += this.manaRecoverSpeed * dt;
        } else {
            this.mana = this.maxMana;
        }
        this.manaBar.progress = this.mana / this.maxMana;
        this.manaLabel.string = this.mana.toFixed(0) + "/" + this.maxMana.toFixed(0);
        
        if (this.mana >= this.manaUse){
            this.mana -= this.manaUse;
            this.generateNode();
        }
    },
});
