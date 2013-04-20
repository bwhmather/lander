define("util/view", [], function(){
'use strict';

var exports = {};


var View = exports.View = function(scene)
{
    this.scene = scene;
};

View.prototype.update = function()
{
    return false;
};


var BodyView = exports.BodyView = function(scene, body, node)
{
    View.prototype.constructor.call(this, scene);
    this.body = body;
    this.node = node;
    scene.add(node)
};

BodyView.prototype = Object.create(View.prototype);

BodyView.prototype.update = function()
{
    if (this.body.space === null) {
        this.scene.remove(this.node);
        return true;
    }

    var pos = this.body.getPos();
    var rot = this.body.a;

    this.node.position.x = pos.x;
    this.node.position.y = pos.y;
    this.node.rotation.z = rot;

    return false;
};


var ViewManager = exports.ViewManager = function(scene)
{
    this.scene = scene;
    this.views = [];
};

ViewManager.prototype.addView = function(view)
{
    this.views.push(view);
};

ViewManager.prototype.update = function()
{
    var i;
    for (i = 0; i < this.views.length; i++) {
        if (this.views[i].update()) {
            delete this.views[i];
            i--;
        }
    }
};

return exports;
});
