define("util/keyboard", [], function(){
'use strict';

var exports = {};


var KeyboardTracker = exports.KeyboardTracker = function()
{
    this._keys = {};
    this._modifiers = {};

    // Shadow callbacks in prototype with methods that bind the correct this
    // and can be removed in destructor.
    this._onKeyDown = this._onKeyDown.bind(this);
    this._onKeyUp = this._onKeyUp.bind(this);

    window.addEventListener("keydown", this._onKeyDown, false);
    window.addEventListener("keyup", this._onKeyUp, false);
};

KeyboardTracker.prototype.KEY_NAMES = {
	'up'        : 38,
	'down'      : 40,
	'left'      : 37,
	'right'     : 39,
	'space'     : 32,
    'backspace' : 8,
	'page-up'   : 33,
	'page-down' : 34,
	'tab'       : 9,
    "escape"    : 27
};

KeyboardTracker.prototype.pressed = function(key, modifiers)
{
    // TODO
    // figure out what to do with modifiers

    var keyCode;

    // convert key description to key code
    if (this.KEY_NAMES.hasOwnProperty(key)) {
        keyCode = this.KEY_NAMES[key];
    } else if (key.length === 1) {
        keyCode = key.toUpperCase().charCodeAt();
    } else {
        throw "Invalid key";
    }

    return keyCode in this._keys;
};

KeyboardTracker.prototype.destroy = function(key, modifiers)
{
    this._keys = this._modifiers = undefined;

    window.removeEventListener("keydown", this._onKeyDown, false);
    window.removeEventListener("keyup", this._onKeyUp, false);
};

KeyboardTracker.prototype._onKeyDown = function(ev)
{
    this._keys[ev.keyCode] = true;

    this._modifiers["ctrl"] = ev.ctrlkey;
    this._modifiers["alt"] = ev.altkey;
    this._modifiers["meta"] = ev.metakey;
    this._modifiers["shift"] = ev.shiftkey;
};

KeyboardTracker.prototype._onKeyUp = function(ev)
{
    delete this._keys[ev.keyCode];

    this._modifiers["ctrl"] = ev.ctrlkey;
    this._modifiers["alt"] = ev.altkey;
    this._modifiers["meta"] = ev.metakey;
    this._modifiers["shift"] = ev.shiftkey;
};

return exports;
});
