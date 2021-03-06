define(['../class', '../collections/bag', '../etc/event-emitter', '../etc/tag'], function (Class, Bag, EventEmitter, Tag) {
    var GameObject;
    Class.registerKeyword('global-event', {
        onInit: function (classInfo) {
            classInfo.globalEvents = {};
            classInfo.allGlobalEvent = {};
        },
        onAdd: function (classInfo, methodDescriptor) {
            if (!classInfo.allParentId[GameObject.id]) {
                throw new Error('To use "global-event" keyword, inherit the Grape.GameObject class!');
            }
            EventEmitter.decompose(methodDescriptor.method, classInfo.globalEvents, methodDescriptor.name);
            return false;
        },
        onFinish: function (classInfo) {
            var i, event, events;
            //add parent events
            for (i = 0; i < classInfo.allParent.length; i++) {
                events = classInfo.allParent[i].globalEvents;
                for (event in events) {
                    (classInfo.allGlobalEvent[event] || (classInfo.allGlobalEvent[event] = [])).push(events[event]);
                }
            }
            //add own events
            events = classInfo.globalEvents;
            for (event in events) {
                (classInfo.allGlobalEvent[event] || (classInfo.allGlobalEvent[event] = [])).push(events[event]);
            }
        }
    });

    function subscribe(th, ev, fn) {
        var proxy = function (payload) {
            fn.call(th, payload);
        };
        th._layer.on(ev, proxy);
        th.on('remove', function () {
            this._layer.off(ev, proxy);
        });
    }

    /**
     * A GameObject is an object which can be added to a layer, and can subscribe to the layer's events with the
     * onGlobal() method or the global-event keyword.
     *
     * @class Grape.GameObject
     * @uses Grape.EventEmitter
     * @uses Grape.Taggable
     * @constructor
     */
    GameObject = Class('GameObject', [EventEmitter, Tag.Taggable], {
        init: function () {
            this._layer = null;
            this.on('add', function () {//TODOv2 optimize
                var myClass = this.getClass(), event, listeners;
                for (event in myClass.allGlobalEvent) {
                    listeners = myClass.allGlobalEvent[event];
                    for (var j = 0; j < listeners.length; j++) {
                        subscribe(this, event, listeners[j]);
                    }
                }
            });
        },
        /**
         * Subscribes to an event on the layer the instance is added to. If the instance is not yet added to any layers,
         * it will subscribe when added.
         *
         * @method onGlobal
         * @param {String} event Event
         * @param {Function} handler Event listener
         */
        onGlobal: function (event, handler) {
            var that = this,
                proxy = function (payload) {
                    handler.call(that, payload);
                };
            if (this._layer) { //already added
                this._layer.on(event, proxy);
            } else {
                this.on('add', function () {
                    this._layer.on(event, proxy);
                });
            }
            this.on('remove', function () {
                this._layer.off(event, proxy);
            });
        },
        /**
         * Removes the instance from the layer.
         *
         * @method remove
         */
        'final remove': function () {
            this._layer.remove(this);
        },
        /**
         * Gets the current game instance through the current layer.
         *
         * @method getGame
         * @return {Grape.Game|null} The current game, or null, if the lookup fails.
         */
        getGame: function () {
            return this._layer === null ? null : this._layer.getGame();
        },
        /**
         * Gets the root layer.
         *
         * @method getScene
         * @return {Grape.Scene|null} The root layer, or null, if the lookup fails.
         */
        getScene: function () {
            return this._layer === null ? null : this._layer.getScene();
        },
        /**
         * Returns the layer the instance is added to.
         *
         * @method getLayer
         * @return {Grape.Layer} The layer
         */
        getLayer: function () {
            return this._layer;
        }
    });

    return GameObject;
});