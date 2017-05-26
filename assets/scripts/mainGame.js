var spriteCreator = require('spriteCreator');
var storageManager = require('storageManager');

var fsm = new StateMachine({
    data:{
        gameDirector: null,
    },
    init: 'hold',
    transitions: [
        // { name: 'stickLengthen', from: 'hold', to: 'stickLenthened'},
        // { name: 'heroTick', from: 'stickLenthened', to: 'heroTicked'},
        // { name: 'stickFall', from: 'heroTicked', to: 'stickFalled'},
        // { name: 'heroMoveToLand', from: 'stickFalled', to: 'heroMovedToLand'},
        // { name: 'landMove', from: 'heroMovedToLand', to: 'hold'},
        // { name: 'heroMoveToStickEnd', from: 'stickFalled', to: 'heroMovedToStickEnd'},
        // { name: 'heroDown', from: 'heroMovedToStickEnd', to: 'heroDowned'},
        // { name: 'gameOver', from: 'heroDowned', to: 'end'},
        // { name: 'restart', from: 'end', to: 'hold'},

        { name: 'stickLengthen', from: 'hold', to: 'stickLenthened'},
        { name: 'heroTick', from: 'stickLenthened', to: 'heroTicked'},
        { name: 'stickFall', from: 'heroTicked', to: 'stickFalled'},
        { name: 'heroMoveToLand', from: 'stickFalled', to: 'heroMovedToLand'},
        { name: 'landMove', from: 'heroMovedToLand', to: 'hold'},
        { name: 'heroMoveToStickEnd', from: 'stickFalled', to: 'heroMovedToStickEnd'},
        { name: 'shortMove', from: 'heroMovedToStickEnd', to: 'hold'},
        { name: 'heroMoveToStickEndToFall', from: 'stickFalled', to: 'heroMovedToStickEndToFall'},
        { name: 'heroDown', from: 'heroMovedToStickEndToFall', to: 'heroDowned'},
        { name: 'gameOver', from: 'heroDowned', to: 'end'},
        { name: 'restart', from: 'end', to: 'hold'},

    ],
    methods:{
        onLeaveHeroTicked(){
            gameDirector.unregisterEvent();
        },
        onStickLengthen(){
            gameDirector.stickLengthen = true;
            gameDirector.stick = gameDirector.createStick();
        },
        onHeroTick(){
            gameDirector.stickLengthen = false;
            gameDirector.ani.play('heroTick');

        },
        onStickFall(){
            var fall = cc.rotateBy(0.5, 90);
            fall.easing(cc.easeIn(3));
            //var callFunc = cc.callFunc(this.heroMove.bind(this));
            var callFunc = cc.callFunc(function(){
                //英雄到第一平台右侧距离
                // var firstLandWidth = gameDirector.firstLand.getContentSize().width;
                // var heroPosX = gameDirector.hero.getPosition().x - gameDirector.runLength;


                var firstLandWidth = gameDirector.firstLand.getPosition().x + gameDirector.firstLand.getContentSize().width;
                var heroPosX = gameDirector.hero.getPosition().x;
                var d1 = firstLandWidth - heroPosX;

                //棍子落下后长度
                var stickLength = gameDirector.stick.height + gameDirector.stick.width*gameDirector.stick.anchorX;
                
                var cWidth = gameDirector.secondLand.center.getContentSize().width;
                var min = d1 + gameDirector.space + gameDirector.secondLand.width*0.5 - cWidth*0.5;
                var max = d1 + gameDirector.space + gameDirector.secondLand.width*0.5 + cWidth*0.5;

                cc.log('移动前判断 1平台x坐标', gameDirector.firstLand.getPosition().x, '1平台宽度',gameDirector.firstLand.getContentSize().width, 
                '英雄坐标',heroPosX, '棍子长度', gameDirector.stick.height, '中心点宽度', cWidth,
                '棍子裁剪宽度', gameDirector.stick.width*gameDirector.stick.anchorX,'d1', d1, 
                '间隔', gameDirector.space, '2平台宽度', gameDirector.secondLand.width, '运行长度', gameDirector.runLength,
                '落下棍子长度', stickLength, '最小', min, '最大', max);

                if(stickLength < d1){
                    fsm.heroMoveToStickEnd();
                    cc.log('移动');
                }else{
                    if(stickLength < d1 + gameDirector.space ||
                    stickLength > d1 + gameDirector.space + gameDirector.secondLand.width){
                        fsm.heroMoveToStickEndToFall();
                        cc.log('落下');
                    }else{
                        cc.log('移动到下一平台');
                        fsm.heroMoveToLand();
                        //如果棍子落在完美点上
                        if(stickLength > d1 + gameDirector.space + gameDirector.secondLand.width*0.5 - cWidth*0.5
                            &&stickLength < d1 + gameDirector.space + gameDirector.secondLand.width*0.5 + cWidth*0.5){
                            cc.log('完美');
                            ++gameDirector.perfect;
                            gameDirector.getScore(gameDirector.perfect);
                            gameDirector.perfectShow(gameDirector.perfect);
                            //完美得分动画???
                        }else{
                            gameDirector.perfect = 0;
                        }
                    }

                }
            })
            var se = cc.sequence(fall, callFunc);
            gameDirector.stick.runAction(se);
        },
        onHeroMoveToLand(){
            var callFunc = cc.callFunc(function(){
                gameDirector.ani.stop('heroRun');
                gameDirector.getScore();
                cc.log('heroMoved:1平台x坐标', gameDirector.firstLand.getPosition().x, '1平台宽度',gameDirector.firstLand.getContentSize().width, 
                '英雄坐标',gameDirector.hero.getPosition().x)
                fsm.landMove();
            });
            gameDirector.ani.play('heroRun');
            gameDirector.heroMove(gameDirector.hero, {length: gameDirector.stick.height, callFunc: callFunc});
        },
        onLandMove(){
            gameDirector.landMoveAndCreate();
        },
        onHeroMoveToStickEnd(){
            var callFunc = cc.callFunc(function(){
                gameDirector.ani.stop('heroRun');
                gameDirector.shortStickLength += gameDirector.stick.height;
                fsm.shortMove();
            });
            gameDirector.ani.play('heroRun');
            gameDirector.heroMove(gameDirector.hero, {length: gameDirector.stick.height, callFunc: callFunc});
        },
        onShortMove(){
            cc.log('onShortMove()');
            gameDirector.registerEvent();
        },
        onHeroMoveToStickEndToFall(){
            var callFunc = cc.callFunc(function(){
                gameDirector.ani.stop('heroRun');
                fsm.heroDown();
            });
            gameDirector.ani.play('heroRun');
            gameDirector.heroMove(gameDirector.hero, {length: gameDirector.stick.height, callFunc: callFunc});
        },
        onHeroDown(){
            var callFunc = cc.callFunc(function(){
                fsm.gameOver();
            });
            gameDirector.stickAndHeroDownAction(callFunc);
        },
        onGameOver(){
            gameDirector.overLay.active = true;
        },
        onRestart(){
            cc.audioEngine.stopAll();
            cc.director.loadScene('game');
        },
    }
});

var gameDirector = null;
var Level = [1, 0.9, 0.8, 0.7, 0.6, 0.5];
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
        secondLand: cc.Node,
        hero: cc.Node,
        currentScore: cc.Label,
        highScore: cc.Label,
        overLay: cc.Node,
        perfectLabel: cc.Node,
        canvas: cc.Node,

        distance: cc.v2(0, 0),
        width: cc.v2(0, 0),
        perfectPointWidth: 0,


        stickWidth: 0,
        stickSpeed: 0,
        heroMoveSpeed: 0,
        moveDuration: 0,
        levelUp: 0,
        gameBgm: cc.AudioClip,
    },

    // use this for initialization
    onLoad: function () {
        gameDirector = this;
        this.ani = this.hero.getComponent(cc.Animation);
        this.stick = null;
        this.stickLengthen = false;                         //棍子增长开关
        this.runLength = 0;                                 //已推移距离
        this.shortStickLength = 0;                          //未达到长度棍子累计距离
        this.worldLength = 0;                               //平台世界长度(所有平台宽度+所有间隔)
        this.score = 0;                                     //当前得分
        this.perfect = 0;                                   //完美次数
        this.space = 0;                                     //当前间隔宽度
        this.lv = 0;                                        //当前游戏难度等级
        this.landNum = 0;                                   //当前一共生成几块平台
        this.changeHighestScoreLabel();

        this.ani.on('stop', (event)=>{
            if(event.target.name === 'heroTick'){
                fsm.stickFall();
            }
        });
    },

    start: function(){
        this.ani.play('waitting');
        this.createNewLand();

        //背景音乐
        if(this.gameBgm){
            cc.audioEngine.play(this.gameBgm, true, 1);
        }
    },

    heroMove: function(target, data){
        var time = data.length/this.heroMoveSpeed;
        var move = cc.moveBy(time, cc.p(data.length, 0));
        if(data.callFunc){
            var se = cc.sequence(move, data.callFunc);
            this.hero.runAction(se);
        }else{
            this.hero.runAction(move);
        }
    },

    landMoveAndCreate:function(){
        var dis = this.stick.height + this.shortStickLength;        //平台移动距离为当前棍子长度+短移动累计长度
        this.runLength += this.stick.height + this.shortStickLength;
        this.shortStickLength = 0;
        this.node.runAction(cc.moveBy(this.moveDuration, cc.p(-dis, 0)));
        this.firstLand = this.secondLand;
        
        this.createNewLand();
    },

    stickAndHeroDownAction: function(callFunc){
        var stickAction = cc.rotateBy(0.5, 90);
        stickAction.easing(cc.easeIn(3));
        this.stick.runAction(stickAction);

        var heroAction = cc.moveBy(0.5, cc.p(0, -300 - this.hero.height));
        heroAction.easing(cc.easeIn(3));
        var seq = cc.sequence(heroAction, callFunc);
        this.hero.runAction(seq);
    },

    getScore: function(num){
        if(num){
            this.score += num;
        }else{
            ++this.score;
        }
        if(storageManager.getHighestScore() < this.score){
            storageManager.setHighestScore(this.score);
            this.changeHighestScoreLabel();
        }
        this.currentScore.string = '得分:'+ this.score;

        //根据当前得分计算当前难度等级
        this.lv = Math.floor(this.score/this.levelUp);
        (this.lv >= Level.length)?(this.lv=Level.length-1):(this.lv);
        //cc.log('getScore()', this.lv);
    },

    changeHighestScoreLabel: function(){
        this.highScore.string = '最高分:' + storageManager.getHighestScore();
    },

    getGameLevel: function(){
        return this.lv;
    },
    
    getWidth: function(){
        var lv = this.getGameLevel();
        var range = this.width.y - this.width.x;
        var width = (Math.random() * range + this.width.x) | 0;
        width = Math.floor(width * Level[lv]);
        return width;
    },

    getSpace: function(){
        var lv = this.getGameLevel();
        var range = this.distance.y - this.distance.x;
        var space = (Math.random() * range + this.distance.x) | 0;
        space = Math.floor(space * (2 - Level[lv]));
        this.space = space;
        return space;

    },

    getPerfectPointWidth: function(){
        var lv = this.getGameLevel();
        var width = Math.floor(this.perfectPointWidth * Level[lv]);
        cc.log('getPerfectPointWidth()', width);
        return width;
    },
    
    registerEvent: function(){
        this.canvas.on(cc.Node.EventType.TOUCH_START, this.touchStart.bind(this), this.node);
        this.canvas.on(cc.Node.EventType.TOUCH_END, this.touchEnd.bind(this), this.node);
        this.canvas.on(cc.Node.EventType.TOUCH_CANCEL, this.touchCancel.bind(this), this.node);
        cc.log('registerEvent-on');
    },

    unregisterEvent: function(){
        this.canvas.targetOff(this.node);
        cc.log('unregisterEvent-off');
    },

    touchStart: function(){
        fsm.stickLengthen();
    },

    touchEnd: function(){
        fsm.heroTick();
    },

    touchCancel: function(){
        this.touchEnd();
    },

    createStick: function(){
        this.stick = spriteCreator.createStick(this.stickWidth);
        cc.log('createStick()', this.hero.getContentSize().width * (1 - this.hero.anchorX), this.stick.width * this.stick.anchorX);
        var x = this.hero.x + this.hero.getContentSize().width * (1 - this.hero.anchorX)
         + this.stick.width * this.stick.anchorX;
        this.stick.setPosition(x, this.firstLand.height);
        this.stick.parent = this.node;
        return this.stick;
    },
    
    createNewLand: function(){
        var winSize = cc.director.getVisibleSize();
        var width = this.getWidth();
        var perfectPointWidth = this.getPerfectPointWidth();
        this.secondLand = spriteCreator.createSecondLand(width, perfectPointWidth);
        this.secondLand.parent = this.node;
        this.space = this.getSpace();
        this.worldLength += this.space + this.firstLand.width;
        var x = this.worldLength + winSize.width; 
        this.secondLand.setPosition(x, 0);

        var landMove = cc.moveBy(this.moveDuration, cc.p(-winSize.width, 0));
        var callback = cc.callFunc(this.registerEvent.bind(this));
        var se =cc.sequence(landMove, callback);
        this.secondLand.runAction(se);

        ++this.landNum;

        cc.log("createNewLand(): 平台:", this.landNum, 
        '新平台宽度',width, '前平台宽度', this.firstLand.width, '间隔', this.space, 'x', x-winSize.width, '运行长度', this.runLength);
    },

    perfectShow(count){
        cc.log('perfectShow()', count);

        this.perfectLabel.getComponent(cc.Label).string = 'perfect *' + count;

        var fadein = cc.fadeIn(0.1);
        var move = cc.moveBy(1, cc.p(0, 0));
        var fadeout = cc.fadeOut(0.5);
        var sq = cc.sequence(fadein, move, fadeout);
        this.perfectLabel.runAction(sq);
    },

    // called every frame, uncomment this function to activate update callback
    update: function (dt) {
        if(this.stickLengthen){
            this.stick.height += dt * this.stickSpeed;
            //cc.log("stickLength:", this.stick.height);
        }
    },
});
module.exports = fsm;