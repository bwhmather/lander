(function(){
'use strict';

var lander;
if(typeof exports === 'undefined'){
	lander = {};

	if(typeof window === 'object'){
		window.lander = lander;
	}
} else {
	lander = exports;
}


var KeyboardTracker = lander.KeyboardTracker = function()
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


// TODO nicer solution (see main function)
var pressedKeys = {};

var KeyboardController = lander.KeyboardController = function(tracker)
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

var Lander = lander.Lander = function(space, pos)
{
    // Physics stuff
    this.bodies = {};
    this.shapes = {};
    this.constraints = {};

    var fuselage = this.bodies["fuselage"] =
            new cp.Body(1, cp.momentForBox(1, 4, 4));
    fuselage.setPos(pos);

    var shape = this.shapes["fuselage"] = new cp.BoxShape(fuselage, 4, 4);
    shape.setElasticity(0);
    shape.setFriction(0.8);

    var engine = this.bodies["engine"] = new cp.Body(
            0.01,
            cp.momentForBox(0.01,1,1)
    );
    engine.setPos(cp.v(0,-20).add(pos));
    this.constraints["engine->fuselage"] = new cp.PivotJoint(
            engine, fuselage,
            cp.v(0,0), cp.v(0,-20)); // TODO

    for (name in this.bodies) space.addBody(this.bodies[name]);
    for (name in this.shapes) space.addShape(this.shapes[name]);
    for (name in this.constraints) space.addConstraint(this.constraints[name]);

    // Non-Physics State
    this.controller = undefined;
    this.fuel = 100;
};

Lander.prototype.update = function(dt)
{
    if (this.controller) {
    }

    this.fuel -= this.throttle * this.fuelConsumption * dt;
    this.thrust = this.throttle * this.engineRating;

    var fuselage = this.bodies["fuselage"];

    fuselage.activate();

    var thrust = 20*this.controller.getThrottle();
    fuselage.f = cp.v(
            -thrust*Math.sin(fuselage.a),
            thrust*Math.cos(fuselage.a)
    );
    fuselage.t = 2*this.controller.getPitchThrottle();

    //this.bodies["fuselage"].setMass(deadWeight + fuel);
}



var View = lander.View = function(scene)
{
    this.scene = scene;
};

View.prototype.update = function()
{
    return false;
};


var BodyView = lander.BodyView = function(scene, body, node)
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


var ViewManager = lander.ViewManager = function(scene)
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


var LanderView = lander.LanderView = function(scene, lander)
{
    View.prototype.constructor.call(this, scene);

    this.fuselage = undefined;

    var loader = new THREE.JSONLoader();
    loader.load('data/lander.js', function (geometry, materials) {
        var material = new THREE.MeshFaceMaterial(materials);
        var mesh = new THREE.Mesh(geometry, material);
        this.fuselage = new BodyView(scene, lander.bodies["fuselage"], mesh);
    }.bind(this));
}

LanderView.prototype = Object.create(View.prototype);

LanderView.prototype.update = function()
{
    if (this.fuselage) {
        this.fuselage.update();
    }
}



var main = lander.main = function()
{
    var space = new cp.Space();
    var scene = new THREE.Scene();

    var viewManager = new ViewManager(scene);

    //space.iterations = 30;
    space.gravity = cp.v(0, -10);

    space.sleepTimeThreshold = 0.5;
    space.collisionSlop = 0.5;


    var floor = space.addShape(new cp.SegmentShape(
            space.staticBody,
            cp.v(-640, 0), cp.v(640, 0), 0)
    );
    floor.setElasticity(1);
    floor.setFriction(1);

    var lander = new Lander(space, cp.v(0, 100));
    lander.controller = new KeyboardController(new KeyboardTracker());
    var landerView = new LanderView(scene, lander);
    viewManager.addView(landerView);

	scene.add( new THREE.AmbientLight( 0x000000 ) );

    var sun = new THREE.PointLight( 0xaaaa99, 2, 1000 );
    sun.position.x = 100;
    sun.position.y = 200;
    sun.position.z = 300;
    scene.add(sun);

    var camera = new THREE.PerspectiveCamera(75, window.innerWidth /
                                                 window.innerHeight, 0.1, 1000);
    camera.position.x = 0;
    camera.position.y = 40;
    camera.position.z = 60;

    var renderer = new THREE.WebGLRenderer({"antialias": true});
    renderer.setSize( window.innerWidth, window.innerHeight );

    document.body.appendChild( renderer.domElement );


    var update = function() {
        requestAnimationFrame(update);
        space.step(1/60);
        lander.update();
        viewManager.update();
        renderer.render(scene, camera);
    };
    update();
}

})();

lander.main();
