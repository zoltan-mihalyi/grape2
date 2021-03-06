define(['grape'], function (Grape) {
    var res = new Grape.ResourceCollection();
    res.sprite('man', 'sprite/man.png', {
        subimages: 4
    });
    res.sprite('wall', 'sprite/wall.png');

    var IngameGUIView = Grape.Class('IngameGUIView', Grape.GUIView, {
        'event domCreated': function (el) {
            var view = this;
            el.innerHTML = '<input type="button" class="keyButton" value="LEFT" data-key="keyDown.left">' +
                '<input type="button" class="keyButton" value="RIGHT" data-key="keyDown.right">';
            el.onclick = function (e) {
                if (e.target.className === 'keyButton') {
                    view.getGame().getScene().emit(e.target.getAttribute('data-key'));
                }
            };
        }
    });

    var LoadingScene = Grape.Scene.extend({
        'event start': function (game) {
            var that = this;
            res.load(function () {
                game.startScene(new Level1());
            }, function () {
                alert('fail');
            }, function (percent) {
                that.progress = percent;
            });
        },
        'event render': function (ctx) {
            ctx.fillStyle = 'black';
            ctx.fillRect(0, 200, this.progress * this.getGame().getScreenWidth() / 100, 60);
        }
    });

    var Level1 = Grape.Scene.extend({
        init: function () {
            var collSystem = new Grape.CollisionSystem();
            this.addView(new IngameGUIView());
            this.addSystem('collision', collSystem);
            this.add(new Man({x: 32, y: 128}));
            this.add(new Wall({x: 32, y: 256}));
            this.add(new Wall({x: 64, y: 256}));
            this.add(new Wall({x: 96, y: 256}));
            this.add(new Wall({x: 128, y: 256}));

            this.add(new Wall({x: 128, y: 192}));
            this.add(new Wall({x: 32, y: 192}));
            collSystem.createStaticPartition('Solid');
        }
    });

    var Wall = Grape.Class('Wall', [Grape.Collidable, Grape.SpriteVisualizer], {
        init: function () {
            this.sprite = res.get('wall');
        },
        'event add': function () {
            this.addTag('Solid');
        }
    });

    var Man = window.Man = Grape.Class('Man', [Grape.Physical, Grape.Collidable, Grape.SpriteVisualizer], {
        init: function () {
            this.sprite = res.get('man');
        },
        'global-event frame': function () {
            this.speedY += 0.3;
            this.subimage = this.subimage % this.sprite.subimages;
        },
        'collision Solid': function (solid) {
            if (solid.y > this.y) {
                this.y = solid.y - this.getHeight();
            }
            this.speedY = 0;
            if (this.getGame().input.isPressed('up')) {
                this.speedY = -6;
            }
        },
        'global-event keyDown': {
            left: function () {
                this.x -= 4;
                this.subimage += 0.5;
            },
            right: function () {
                this.x += 4;
                this.subimage += 0.5;
            }
        }
    });

    Platformer = new Grape.Game({container: 'game'});
    Platformer.start(new LoadingScene);

});