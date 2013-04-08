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


var KeyboardController = lander.KeyboardController = function()
{
    this.throttle = 0.0;

    // three ways of controlling pitch:
    //  - set angular thrust
    //  - set desired angular speed and allow lander autopilot to vary thrust
    //    accordingly
    //  - set desired pitch and allow autopilot to do all of the hard work

    // radians
    this.desiredYaw;

    // radians-per-second
    this.desiredYawRate;

    // -1 to 1
    this.yawThrottle;

    window.addEventListener("keydown", this.onKeyDown.bind(this));
    window.addEventListener("keyup", this.onKeyUp.bind(this));
};

KeyboardController.prototype.onKeyDown = function(ev)
{
    switch (ev.keyCode) {
        case "W".charCodeAt():
            this.throttle = 1.0;
            break;
        case "S".charCodeAt():
            break;
        case "A".charCodeAt():
            break;
        case "D".charCodeAt():
            break;
        default:
            console.log(ev.keyCode);
    }
};

KeyboardController.prototype.onKeyUp = function(ev)
{
    switch (ev.keyCode) {
        case "W".charCodeAt():
            this.throttle = 0.0;
            break;
        case "S".charCodeAt():
            break;
        case "A".charCodeAt():
            break;
        case "D".charCodeAt():
            break;
        default:
            console.log(ev.keyCode);
    }
};


var Lander = lander.Lander = function(space, pos)
{
    // Physics stuff
    this.bodies = {};
    this.shapes = {};
    this.constraints = {};

    var fuselage = this.bodies["fuselage"] =
            new cp.Body(1, cp.momentForBox(1, 30, 30));
    fuselage.setPos(pos);

    var shape = this.shapes["fuselage"] = new cp.BoxShape(fuselage, 30, 30);
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

    //this.bodies["leftThruster"] = new cp.Body();
    //this.constraints["leftThruster->body"] = new cp.PinJoint(engine, body);

    //this.bodies["rightThruster"] = new cp.Body();
    //this.constraints["rightThruster->body"] = new cp.PinJoint(engine, body);

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

    //this.bodies["fuselage"].setMass(deadWeight + fuel);

    this.bodies["fuselage"].activate();
    this.bodies["fuselage"].f = cp.v(0, 300*this.controller.throttle);


    //this.model["leftThruster"].setForce(cp.v(0,this.torque));
    //this.model["rightThruster"].setForce(cp.v(0, -this.torque));
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



var ThrusterView = lander.ThrusterView = function(scene, body, particle)
{
    View.prototype.constructor.call(this, scene);
    this.body = body;
};

ThrusterView.prototype = Object.create(View.prototype);

ThrusterView.prototype.update = function()
{
    if (this.body.space === null) {
        this.scene.remove(this.node);
        return true;
    }

    this.body.getForce();
    // TODO particles

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

    var geometry = new THREE.CubeGeometry(30,30,30);
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
    space.gravity = cp.v(0, -100);
    space.sleepTimeThreshold = 0.5;
    space.collisionSlop = 0.5;


    var floor = space.addShape(new cp.SegmentShape(
            space.staticBody,
            cp.v(0, 0), cp.v(640, 0), 0)
    );
    floor.setElasticity(1);
    floor.setFriction(1);

    var lander = new Lander(space, cp.v(250, 300));
    lander.controller = new KeyboardController();
    var landerView = new LanderView(scene, lander);
    viewManager.addView(landerView);

	scene.add( new THREE.AmbientLight( 0x000000 ) );

    var sun = new THREE.PointLight( 0xffffff, 2, 1000 );
    sun.position.x = 0;
    sun.position.y = 200;
    sun.position.z = 300;
    scene.add(sun);

    var camera = new THREE.PerspectiveCamera(75, window.innerWidth /
                                                 window.innerHeight, 0.1, 1000);
    camera.position.z = 300;
    camera.position.y = 160;
    camera.position.x = 250;

    var renderer = new THREE.WebGLRenderer();
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
