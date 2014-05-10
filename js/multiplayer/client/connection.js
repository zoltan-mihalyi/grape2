define([], function () {

    var Connection = Grape.Class('Multiplayer.Connection', Grape.EventEmitter, {
        STATUS_CONNECTING: 0,
        STATUS_OPEN: 1,
        STATUS_CLOSED: 2,
        STATUS_ERROR: 3,
        init: function (opts) {
            this._opts = opts;
        },
        _start: function () {
            var opts = this._opts || {},
                address = opts.address || 'localhost',
                conn = this, websocket = new WebSocket('ws://' + address);

            this._mapper = opts.mapper || {};
            this._status = this.STATUS_CONNECTING;

            this._ws = websocket;
            websocket.onopen = function (evt) {
                conn._status = conn.STATUS_OPEN;
                conn.emit('connect');
            };
            websocket.onclose = function (evt) {
                conn._status = conn.STATUS_CLOSED;
                conn.emit('close');
            };
            websocket.onmessage = function (evt) {
                var message = JSON.parse(evt.data);
                if (message.command) { //single message
                    conn.emit(message.command, message.data);
                } else {//multiple message
                    for (var i = 0; i < message.length; i++) {
                        //console.log(message[i]);
                        conn.emit(message[i].command, message[i].data); //todo ugly
                    }
                }
            };
            websocket.onerror = function (evt) {
                conn._status = conn.STATUS_ERROR;
                conn.emit('error');
            };
            delete this._opts;
        },
        'event gameStarted': function (data) {
            var Scene = this._mapper.getById(data.sceneId);
            if (!Scene) {
                throw 'Scene does not exist in mapper: ' + data.sceneId;
            }
            this._game.startScene(new Scene(data.sceneParameters));
        },
        'event attrSync': function (data) {
            var id = data.id;
            var attrs = data.attrs;
            var all = this._game.scene.get(); //todo improve performance
            for (var i = 0; i < all.length; i++) {
                if (all[i]._syncedId === id) {
                    for (var j in attrs) {
                        all[i][j] = attrs[j];
                    }
                }
            }
        },
        'event controlAdded': function (data) {
            var id = data.id;
            var all = this._game.scene.get(); //todo improve performance
            for (var i = 0; i < all.length; i++) {
                if (all[i]._syncedId === id) {
                    all[i]._controllable = true;
                }
            }
        },
        'event command': function (data) {
            //console.log(data);
            var id = data.id;
            var all = this._game.scene.get(); //todo improve performance
            for (var i = 0; i < all.length; i++) {
                if (all[i]._syncedId === id) {
                    console.log(all[i].backgroundColor);
                    all[i][data.command]._original.apply(all[i], []);
                }
            }
        },
        getStatus: function () {
            return this._status;
        },
        sendMessage: function (command, data) {
            this._ws.send(JSON.stringify({
                command: command,
                data: data
            }));
        }
    });

    return Connection;

});