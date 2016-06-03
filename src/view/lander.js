define("view/lander", ["util/view"], function(util_view){
"use strict"

var exports = {};

var View = util_view.View,
    BodyView = util_view.BodyView;

var LanderView = exports.LanderView = function(scene, lander)
{
    View.prototype.constructor.call(this, scene);

    this.fuselage = undefined;
    var loader = new THREE.OBJLoader();
    loader.load('build/lander.obj', function (object) {
        this.fuselage = new BodyView(scene, lander.bodies["fuselage"], object);
    }.bind(this));

}

LanderView.prototype = Object.create(View.prototype);

LanderView.prototype.update = function()
{
    if (this.fuselage) {
        this.fuselage.update();
    }
}

return exports;
});
