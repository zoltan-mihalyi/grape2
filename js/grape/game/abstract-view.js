define(['../class', '../env', '../game/system', '../utils'], function (Class, Env, System, Utils) {
    function propValue(prop, max) {
        if (typeof (prop) === 'function') {
            return prop(max);
        }
        if (parseFloat(prop) + '' === prop + '') { //number format
            return prop * 1;
        } else {
            return createFunction('p', 'return ' + prop.replace(/%/g, '/100*p') + ';')(max);
        }
    }

    var fnCache = {}; //params+body -> function
    var cacheOrder = []; //params+body

    function createFunction(params, body) {
        /*jslint evil: true */
        var key = params + ';' + body;
        if (!fnCache[key]) {
            if (cacheOrder.length >= 100) { //cache full
                delete fnCache[cacheOrder.shift()];
            }
            fnCache[key] = new Function(params, body);
            cacheOrder.push(key);
        }
        return fnCache[key];
    }

    //TODOv2 follow player etc.
    /**
     * Provides a viewport to the game. The dimension properties (width, height, left, top, originX, originY) are
     * calculated dynamically. You can set these properties as functions or evaluated strings, like '30%+40'.
     *
     * @class Grape.AbstractView
     * @uses Grape.System
     * @constructor
     * @param {Object} opts Initial properties
     */
    return Class('AbstractView', System, {
        init: function (opts) {
            /**
             * The width of the view. The maximum value (100%) is the container width.
             *
             * @property width
             * @type {String|Number|Function}
             * @default '100%'
             */
            this.width = '100%';
            /**
             * The height of the view. The maximum value (100%) is the container height.
             *
             * @property height
             * @type {String|Number|Function}
             * @default '100%'
             */
            this.height = '100%';
            /**
             * The left axis of the view in the container. The maximum value (100%) is the container width.
             *
             * @property left
             * @type {String|Number|Function}
             * @default 0
             */
            this.left = 0;
            /**
             * The top axis of the view in the container. The maximum value (100%) is the container height.
             *
             * @property top
             * @type {String|Number|Function}
             * @default 0
             */
            this.top = 0;
            /**
             * The horizontal origin of the view. Tells where should a point with x = view.x appear on the screen. The
             * maximum value (100%) is the width of the view.
             *
             * @property originX
             * @type {String|Number|Function}
             * @default 0
             */
            this.originX = 0;
            /**
             * The vertical origin of the view. Tells where should a point with y = view.y appear on the screen. The
             * maximum value (100%) is the height of the view.
             *
             * @property originY
             * @type {String|Number|Function}
             * @default 0
             */
            this.originY = 0;

            /**
             * The x coordinate of the showed area.
             *
             * @property x
             * @type {Number}
             * @default 0
             */
            this.x = 0;

            /**
             * The y coordinate of the showed area.
             *
             * @property y
             * @type {Number}
             * @default 0
             */
            this.y = 0;
            /* TODOv2 doc
             * The zoom level of the view.
             *
             * @property zoom
             * @type {Number}
             * @default 1
             */
            this.zoom = 1; //TODOv2 use
            /**
             * The global alpha value of the view.
             *
             * @property alpha
             * @type {number}
             * @default 1
             */
            this.alpha = 1;
            Utils.extend(this, opts);
        },
        _calculateMouse: function (mouse) {
            /**
             * Information about the mouse relative to the view.
             *
             * @property mouse
             * @type {number}
             */
            var viewX = this.mouse.view.x = (mouse.x - this.getLeft()) / this.zoom;
            var viewY = this.mouse.view.y = (mouse.y - this.getTop()) / this.zoom;
            this.mouse.x = viewX + this.x - this.getOriginX();
            this.mouse.y = viewY + this.y - this.getOriginY();
            this.mouse.inView = false;
            if (viewX >= 0 && viewY >= 0 && viewX < this.getWidth() && viewY < this.getHeight()) {
                this.mouse.inView = true;
                mouse.view = this;
                /**
                 * Emitted to the containing layer when the mouse position changed according to the position in the
                 * previous frame. The parameter is the view.
                 *
                 * @event mouseMoveView (layer)
                 */
                this.getLayer().emit('mouseMoveView', this);
            }
        },
        'event start': function (game) {
            var el;
            this._game = game;
            this.mouse = {
                view: {}
            };
            /* istanbul ignore else */
            if (Env.browser) {
                el = this.el = this.createDom();
                el.style.position = 'absolute';
                this.updateSize();
                this._game.getScreen().appendChild(el);
                /**
                 * This event is fired after the createDom() method is called and the DOM element is appended to the
                 * container. The parameter is the element.
                 *
                 * @event domCreated
                 */
                this.emit('domCreated', el);
            }
            this._calculateMouse(game.input.mouse);
        },
        'event stop': function () {
            /* istanbul ignore else */
            if (Env.browser) {
                this.el.parentNode.removeChild(this.el);
            }
        },
        'event renderLayer': function () {
            if (Env.browser) {
                this.el.style.left = this.getLeft() / this.zoom + 'px';
                this.el.style.top = this.getTop() / this.zoom + 'px';
                this.el.style.opacity = this.alpha;
                this.el.style.zoom = this.zoom;
                this.updateSize();
            }
        },
        'event mouseMove': function (mouse) {
            this._calculateMouse(mouse);
        },
        /**
         * This method is called in each render frame, and should be update the displayed element's width.
         * The default functionality is setting the style width and height, but for canvas it is different.
         *
         * @method updateSize
         */
        updateSize: function () {
            this.el.style.width = this.getZoomedWidth() + 'px';
            this.el.style.height = this.getZoomedHeight() + 'px';
        },
        /**
         * Returns the calculated width left.
         *
         * @method getLeft
         * @return {Number} calculated left
         */
        getLeft: function () {
            return propValue(this.left, this._game.getScreenWidth()) >> 0;
        },
        /**
         * Returns the calculated top value.
         *
         * @method getTop
         * @return {Number} calculated top
         */
        getTop: function () {
            return propValue(this.top, this._game.getScreenHeight()) >> 0;
        },
        /**
         * Returns the calculated width value.
         *
         * @method getWidth
         * @return {Number} calculated width
         */
        getWidth: function () {
            return propValue(this.width, this._game.getScreenWidth()) >> 0;
        },
        /**
         * Returns the calculated height value.
         *
         * @method getHeight
         * @return {Number} calculated height
         */
        getHeight: function () {
            return propValue(this.height, this._game.getScreenHeight()) >> 0;
        },
        /**
         * Returns the calculated originX value.
         *
         * @method getOriginX
         * @return {Number} calculated originX
         */
        getOriginX: function () {
            return propValue(this.originX, this.getWidth()) >> 0;
        },
        /**
         * Returns the calculated originY value.
         *
         * @method getOriginY
         * @return {Number} calculated originY
         */
        getOriginY: function () {
            return propValue(this.originY, this.getHeight()) >> 0;
        },
        /**
         * Returns the width of the visible part of the scene (if zoom is increased, becomes smaller)
         *
         * @method getZoomedWidth
         * @return {number} width of the visible part
         */
        getZoomedWidth: function () {
            return this.getWidth() / this.zoom;
        },
        /**
         * Returns the height of the visible part of the scene (if zoom is increased, becomes smaller)
         *
         * @method getZoomedHeight
         * @return {number} height of the visible part
         */
        getZoomedHeight: function () {
            return this.getHeight() / this.zoom;
        },
        /**
         * This abstract method should create the HTMLElement which serves
         *
         * @method createDom
         * @return {HTMLElement} Canvas
         */
        'abstract createDom': null
    });
});