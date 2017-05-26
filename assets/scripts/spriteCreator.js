const colorType = cc.Enum({
   'BLACK': -1,
   'RED': -1,
   'GREEN': -1,
   'BLUE': -1,
});       


var spriteCreator = (function(){
    var spriteFrameCache = null;
    var count = 0;
    
    return{
        createSecondLand: function(width, pWidth){

            var colorType = [cc.Color.WHITE,
                             cc.Color.GRAY, 
                             cc.Color.YELLOW, 
                             cc.Color.ORANGE, 
                             cc.Color.CYAN,
                             cc.Color.GREEN,
                             cc.Color.RED,];

            if(!width){
                width = Math.floor(cc.random0To1()*80)+120;
                //cc.log('createSLand width:', width);
            }
            if(!pWidth){
                pWidth = 10;
                //cc.log('createSLand width:', width);
            }

            var newLand = new cc.Node('newLand');
            newLand.anchorX = 0;
            newLand.anchorY = 0;
            var sprite = newLand.addComponent(cc.Sprite);
            sprite.sizeMode = cc.Sprite.SizeMode.CUSTOM;
            newLand.color = cc.Color.BLACK;
            newLand.height = 300;
            newLand.width = width;
            newLand.zIndex = 0;
            

            var perfactPoint = new cc.Node('perfactPoint');
            perfactPoint.anchorX = 0.5;
            perfactPoint.anchorY = 1;
            var pSprite = perfactPoint.addComponent(cc.Sprite);
            pSprite.sizeMode = cc.Sprite.SizeMode.CUSTOM;

            perfactPoint.color = colorType[count];
            ((++count) > (colorType.length - 1))?(count = count - colorType.length):count;

            perfactPoint.parent = newLand;
            perfactPoint.height = pWidth;
            perfactPoint.width = pWidth;
            perfactPoint.setPosition(newLand.width/2, newLand.height);
            perfactPoint.zIndex = 100;
            if(spriteFrameCache){
                sprite.spriteFrame = spriteFrameCache;
                pSprite.spriteFrame = spriteFrameCache;
            }else{
                cc.loader.loadRes('hero/blank', cc.SpriteFrame, (err, SpriteFrame) => {
                    spriteFrameCache = SpriteFrame;
                    sprite.spriteFrame = SpriteFrame;
                    pSprite.spriteFrame = SpriteFrame;
                });
            }
            newLand.center = perfactPoint;
            return newLand;
        },

        createStick: function(width){
            var stick = new cc.Node('stick');
            stick.anchorY = 0;
            var stickSprite = stick.addComponent(cc.Sprite);
            stickSprite.sizeMode = cc.Sprite.SizeMode.CUSTOM;
            stickSprite.spriteFrame = spriteFrameCache;
            stick.color = cc.Color.BLACK;
            stick.height = 0;
            stick.width = width;
            return stick;
        },
    }
})();
module.exports = spriteCreator;
