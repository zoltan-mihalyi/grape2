define(['class'], function (Class) {
    var methodNames, methods = {};
    //TODO implement methods if not available
    if (Object.getOwnPropertyNames) {
        methodNames = Object.getOwnPropertyNames(Array.prototype);
    } else {
        methodNames = ['concat', 'constructor', 'indexOf', 'join', 'pop', 'push', 'reverse', 'shift', 'slice', 'splice', 'sort', 'toString', 'unshift', 'valueOf']; //IE8
    }

    for (var i = methodNames.length - 1; i >= 0; i--) {
        methods[methodNames[i]] = Array.prototype[methodNames[i]];
    }

    return Class('Array', methods);
});