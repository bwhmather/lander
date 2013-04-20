define("control/keyboard", [], function(){
'use strict';

var exports = {};


var KeyboardController = exports.KeyboardController = function(tracker)
{
    this._tracker = tracker;
};

KeyboardController.prototype.getThrottle = function()
{
    if (this._tracker.pressed("W")) {
        return 1.0;
    } else {
        return 0.0;
    }
};

KeyboardController.prototype.getPitchThrottle = function()
{
    return (this._tracker.pressed("A") ? 0.0 : -1.0) +
           (this._tracker.pressed("D") ? 0.0 :  1.0);
};

return exports;
});
