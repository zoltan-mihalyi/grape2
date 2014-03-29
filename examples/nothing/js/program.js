require(['grape'], function (Grape) {
    A = Grape.Class('A', {
        'final init': function () {
            this.asd = 1;
        },
        'abstract getX': 0,
        'static asd': 12,
        'abc': function () {

        },
        'event start': function () {
        }//A
    });

    B = Grape.Class('B', A, {
        'override getX': function () {

        },
        'final override chainable abc': function () {
            var a = 0;
        },
        'event abc': function () {

        },
        'event start': function () {
        }//B
    });

    C = Grape.Class('C', [B], {});

    X = Grape.Class('X', {
        init2: function () {
        }
    });

    Z = Grape.Class('Z', [C, X]);

    new Z().getClass();
});