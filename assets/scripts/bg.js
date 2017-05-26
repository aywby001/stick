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
    },

    // use this for initialization
    onLoad: function () {
        var str = 'bg';
        var num = Math.floor(cc.random0To1()*3)+1;
        str = str + num;
        var bgSprite = this.getComponent(cc.Sprite);
        cc.loader.loadRes('hero/' + str, cc.SpriteFrame, (err, SpriteFrame) =>{
            bgSprite.spriteFrame = SpriteFrame;
        })
        cc.log('onLoad() str:', str);
    },

    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {

    // },
});
