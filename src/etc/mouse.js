define(['../class', '../game/game-object', './aabb'], function (Class, GameObject, AABB) { //TODO scroll fail
    var detectMouseOver = function (el, ctx) {
        var bounds = el.getBounds(), mouse = ctx.view.mouse;
        if (mouse.x >= bounds.left && mouse.x < bounds.right && mouse.y >= bounds.top && mouse.y < bounds.bottom) {
            if (!el._mouseOver) {
                el._mouseOver = true;
                el.emit('mouseOver');
            }
        } else if (el._mouseOver) {
            el._mouseOver = false;
            el.emit('mouseOut');
        }
    }; //TODO only if mouse is on the screen!

    return Class('Mouse', [GameObject, AABB], {
        init: function () {
            //detectMouseOver(this);
        },
        'global-event render': function (ctx) { //TODO what if there are more than one views
            detectMouseOver(this, ctx);
        },

        'global-event keyPress': { //TODO create with loop
            mouseLeft: function () {
                if (this._mouseOver) {
                    this.emit('localPress.mouseLeft');
                }
            },

            mouseMiddle: function () {
                if (this._mouseOver) {
                    this.emit('localPress.mouseMiddle');
                }
            },

            mouseRight: function () {
                if (this._mouseOver) {
                    this.emit('localPress.mouseRight');
                }
            }
        },

        'global-event keyRelease': {
            mouseLeft: function () {
                if (this._mouseOver) {
                    this.emit('localRelease.mouseLeft');
                }
            },

            mouseMiddle: function () {
                if (this._mouseOver) {
                    this.emit('localRelease.mouseMiddle');
                }
            },

            mouseRight: function () {
                if (this._mouseOver) {
                    this.emit('localRelease.mouseRight');
                }
            }
        },

        'global-event keyDown': {
            mouseLeft: function () {
                if (this._mouseOver) {
                    this.emit('localDown.mouseLeft');
                }
            },

            mouseMiddle: function () {
                if (this._mouseOver) {
                    this.emit('localDown.mouseMiddle');
                }
            },

            mouseRight: function () {
                if (this._mouseOver) {
                    this.emit('localDown.mouseRight');
                }
            }
        },
        'abstract getBounds': null,
        'abstract getLeft': null,
        'abstract getTop': null,
        'abstract getRight': null,
        'abstract getBottom': null,
        'abstract getWidth': null,
        'abstract getHeight': null
    });
});