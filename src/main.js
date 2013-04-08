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

// TODO nicer solution (see main function)
var pressedKeys = {};

var KeyboardController = lander.KeyboardController = function()
{

};

KeyboardController.prototype.getThrottle = function()
{
    if ("W".charCodeAt() in pressedKeys) {
        return 1.0;
    } else {
        return 0.0;
    }
};

KeyboardController.prototype.getPitchThrottle = function()
{
    return ("A".charCodeAt() in pressedKeys ? 0.0 : -1.0) +
           ("D".charCodeAt() in pressedKeys ? 0.0 :  1.0);
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

    var geometry = new THREE.CubeGeometry(4,4,4);
    var material = new THREE.MeshPhongMaterial({
            ambient: 0x555555, color: 0x555555, specular: 0xffffff,
            shininess: 50, shading: THREE.SmoothShading
    });
    var mesh = new THREE.Mesh(geometry, material);

    this.fuselage = new BodyView(scene, lander.bodies["fuselage"], mesh);
}

LanderView.prototype = Object.create(View.prototype);

LanderView.prototype.update = function()
{
    this.fuselage.update();
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
    lander.controller = new KeyboardController();
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

    // TODO
    window.addEventListener("keydown", function(ev) {
        pressedKeys[ev.keyCode] = true;
    });
    window.addEventListener("keyup", function(ev) {
        delete pressedKeys[ev.keyCode];
    });


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
