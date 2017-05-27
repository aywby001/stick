var spriteCreator = require('spriteCreator');
cc.Class({
    extends: cc.Component,

    properties: {
        // foo: {
        //    default: null,      // The default value will be used only when the component attaching
        //                           to a node for the first time
        //    url: cc.Texture2D,  // optional, default is typeof default
        //    serializable: true, // optional, default is true
        //    visible: true,      // optional, default is true
        //    displayName: 'Foo', // optional
        //    readonly: false,    // optional, default is false
        // },
        // ...
        firstLand: cc.Node,
        hero: cc.Node,
        secondLand: cc.Node,
        stickWidth: 0,
        stickSpeed: 0,
        heroMoveSpeed: 0,
        moveDuration: 0,
        welcomeBgm: cc.AudioClip,
        startLabel: cc.Label,
    },

    // use this for initialization
    onLoad: function () {
        cc.log('welcome onload()');
        this.stick = null;
        this.stickLength = 0;       //棍子长度
        this.space = 0;             //两个平台间距
        this.runLength = 0;         //移动长度
        this.setTimeout1 = null;
        this.setTimeout2 = null;
        cc.game.welcome = this;
    },

    start: function(){
        cc.log('start()');

        this.ani = this.hero.getComponent(cc.Animation);
        this.ani.play('waitting');

        //背景音乐
        if(this.welcomeBgm){
            cc.audioEngine.play(this.welcomeBgm, true, 1);
        }

        //创建第二个平台
        this.createSecondLand();
    },

    closeTimer: function(){
        if(this.setTimeout1){
            clearTimeout(this.setTimeout1);
        }
        if(this.setTimeout2){
            clearTimeout(this.setTimeout2);
        }
    },

    createSecondLand: function(){
        var winSize = cc.director.getWinSize();
        this.secondLand = spriteCreator.createSecondLand();
        this.secondLand.parent = this.node;
        this.space = Math.floor(cc.random0To1()*100)+50;
        this.secondLand.setPosition(this.space + this.firstLand.width
            + this.runLength + winSize.width, 0);

        this.secondLand.runAction(cc.moveBy(this.moveDuration, cc.p(-winSize.width, 0)));

        //英雄右侧到第一平台右侧剩余距离
        var firstLandWidth = this.firstLand.getContentSize().width;
        var heroPosX = this.hero.getPosition().x - this.runLength;
        var d1 = firstLandWidth - heroPosX;

        //棍子长度: 英雄右侧到第一平台右侧剩余距离 + 两个平台间距 + 第二个平台宽度*0.5
        this.stickLength = d1 + this.space + this.secondLand.width * 0.5;

        //因为资源在回调内赋值，所以延时创建棍子，保证能成功创建
        this.setTimeout1 = setTimeout(() =>{
            this.ani.play('stick');
            this.createStick(this.stickWidth);
            this.setTimeout1 = null;
        },3000);
    },

    landMoveAndCreate: function(){
        cc.log('landMove()');
        this.node.runAction(cc.moveBy(this.moveDuration, cc.p(-this.stickLength, 0)));
        this.firstLand = this.secondLand;
        
        this.createSecondLand();
    },

    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {
    // },

    createStick: function(width){
        cc.log("createStick()");
        //创建棍子
        this.stick = spriteCreator.createStick(width);
        var x = this.hero.x + this.hero.getContentSize().width * (1 - this.hero.anchorX)
         + this.stick.width * this.stick.anchorX;
        this.stick.setPosition(x, this.firstLand.height);
        this.stick.parent = this.node;

        //开启棍子增长计时器
        this.schedule(this.updateStick, 0.2);
    },

    updateStick: function(){
        if(this.stick.height < this.stickLength){
            //cc.log('schedule() height:',this.stick.height);
            this.stick.height += 0.1 * this.stickSpeed;
            if(this.stick.height > this.stickLength){
                this.stick.height = this.stickLength;
                this.unschedule(this.updateStick);
                this.stickFall();
            }
        }
    },

    stickFall: function(){
        cc.log('stickFall()');
        //停止英雄提棍子动作
        this.ani.stop('stick');

        var fall = cc.rotateBy(0.5, 90);
        fall.easing(cc.easeIn(3));
        var callFunc = cc.callFunc(this.heroMove.bind(this));
        var se = cc.sequence(fall, callFunc);
        this.stick.runAction(se);
    },
    
    heroMove: function(){
        cc.log('heroMove()');
        var callFunc = cc.callFunc(() => {
            this.ani.stop('heroRun');
            this.ani.play('waitting');
            this.setTimeout2 = setTimeout(()=> {
                this.landMoveAndCreate();
                this.setTimeout2 = null;
            }, 5000);
        })
        this.ani.play('heroRun');
        this.runLength += this.stickLength;

        if(this.runLength >= 1000){
            this.startLabel.node.active = true;
        }

        var time = this.stickLength/this.heroMoveSpeed;
        var move = cc.moveBy(time, cc.p(this.stickLength, 0));
        var se = cc.sequence(move, callFunc);
        this.hero.runAction(se);
    },
});
