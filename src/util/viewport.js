define("util/viewport", [], function(){
'use strict';

var exports = {};


var ViewportResizer = exports.ViewportResizer = function(camera, renderer)
{
    this._camera = camera;
    this._renderer = renderer;

    this._onResize = this._onResize.bind(this);
    window.addEventListener("resize", this._onResize, false);
    this._onResize();
};

ViewportResizer.prototype._onResize = function()
{
    this._camera.aspect = window.innerWidth/window.innerHeight;
    this._camera.updateProjectionMatrix();

    this._renderer.setSize(window.innerWidth, window.innerHeight);
};

ViewportResizer.prototype.destroy = function()
{
    window.removeEventListener("resize", this._onResize, false);
};

return exports;
});
