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



var Lander = lander.Lander = function(space, pos)
{
    // Physics stuff
    this.bodies = {};
    this.shapes = {};
    this.constraints = {};

    var fuselage = this.bodies["fuselage"] =
            new cp.Body(mass, cp.momenForBox(1, 30, 30));
    fuselage.setPos(pos);

    var shape = this.shapes["fuselage"] = new cp.BoxShape(fuselage, 30, 30);
    shape.setElasticity(0);
    shape.setFriction(0.8);


    var engine = this.bodies["engine"] = new cp.Body();
    engine.setPos(cp.v(0,0).add(pos));
    this.constraints["engine->fuselage"] = new cp.PinJoint(
            engine, fuselage,
            cp.v(0,0), cp.v(0,0)); // TODO

    //this.bodies["leftThruster"] = new cp.Body();
    //this.constraints["leftThruster->body"] = new cp.PinJoint(engine, body);

    //this.bodies["rightThruster"] = new cp.Body();
    //this.constraints["rightThruster->body"] = new cp.PinJoint(engine, body);

    map(space.addBody, this.bodies);
    map(space.addShape, this.shapes);
    map(space.addConstraint, this.constraints);


    // Non-Physics State
    this.controller = undefined;
    this.fuel = 100;
};

Lander.prototype = Object.create(Object.prototype);

Lander.prototype.update = function(dt)
{
    if (this.controller) {
        thi
    }

    this.fuel -= this.throttle * this.fuelConsumption * dt;
    this.thrust = this.throttle * this.engineRating;

    this.bodies["fuselage"].setMass(deadWeight + fuel);

    this.model["engine"].setForce(cp.v(0,this.thrust));

    this.model["leftThruster"].setForce(cp.v(0,this.torque));
    this.model["rightThruster"].setForce(cp.v(0, -this.torque));
}



var View = lander.View = function(scene)
{
    this.scene = null;
    this.dead = false;
};

View.prototype = Object.create(Object.prototype);

View.prototype.bind = function(scene)
{
    this.scene = scene;
}

View.prototype.update = function()
{
};



var BodyView = lander.BodyView = function(body, node)
{
    this.body = body;
    this.node = node;
};

BodyView.prototype = Object.create(View.prototype);

BodyView.prototype.bind = function(scene)
{
    View.prototype.bind.call(this, scene);
    this.scene.add(this.node);
};

BodyView.prototype.update = function()
{
    if (this.body.space === null) {
        this.scene.remove(this.node);
        this.dead = true;
        return;
    }

    var pos = this.body.getPos();
    var rot = this.body.a;

    this.node.position.x = pos.x;
    this.node.position.y = pos.y;
    this.node.rotation.z = rot;
};



var ThrusterView = lander.ThrusterView = function(body, particle)
{
    this.body = body;
};

ThrusterView.prototype.update = function()
{
    if (this.body.space === null) {
        this.scene.remove(this.node);
        this.dead = true;
        return;
    }
    this.body.getForce();
};



var ViewManager = lander.ViewManager = function(scene)
{
    this.scene = scene;
    this.views = [];
};

ViewManager.prototype = Object.create(Object.prototype);

ViewManager.prototype.addView = function(view)
{
    view.bind(this.scene);
    this.views.push(view);
};

ViewManager.prototype.update = function()
{
    var i;
    for (i = 0; i < this.views.length; i++) {
        this.views[i].update();
        if (this.views[i].dead) {
            delete this.views[i];
            i--;
        }
    }
};





var main = lander.main = function()
{
    var space = new cp.Space();
    var scene = new THREE.Scene();

    var viewManager = new ViewManager(scene);

    //space.iterations = 30;
    space.gravity = cp.v(0, -100);
    space.sleepTimeThreshold = 0.5;
    space.collisionSlop = 0.5;

    var body, staticBody = space.staticBody;
    var shape;

    var floor = space.addShape(new cp.SegmentShape(space.staticBody, cp.v(0, 0), cp.v(640, 0), 0));
    floor.setElasticity(1);
    floor.setFriction(1);

    var geometry = new THREE.CubeGeometry(30,30,30);
    var material = new THREE.MeshPhongMaterial( { ambient: 0x555555, color: 0x555555, specular: 0xffffff, shininess: 50, shading: THREE.SmoothShading })
    // Add lots of boxes.
    for(var i=0; i<14; i++){
        for(var j=0; j<=i; j++){
            body = space.addBody(new cp.Body(1, cp.momentForBox(1, 30, 30)));
            body.setPos(cp.v(j*32 - i*16 + 320, 540 - i*32));

            shape = space.addShape(new cp.BoxShape(body, 30, 30));
            shape.setElasticity(0);
            shape.setFriction(0.8);

            viewManager.addView(new BodyView(body, new THREE.Mesh( geometry, material )));
        }
    }

    // Add a ball to make things more interesting
    var radius = 15;
    body = space.addBody(new cp.Body(10, cp.momentForCircle(10, 0, radius, cp.v(0,0))));
    body.setPos(cp.v(320, radius+5));

    shape = space.addShape(new cp.CircleShape(body, radius, cp.v(0,0)));
    shape.setElasticity(0);
    shape.setFriction(0.9);


	scene.add( new THREE.AmbientLight( 0x000000 ) );

    var light1 = new THREE.PointLight( 0xff0040, 2, 1000 );
    light1.position.x = 0;
    light1.position.y = 200;
    light1.position.z = 300;
    scene.add( light1 );

    var light2 = new THREE.PointLight( 0x0040ff, 2, 1000 );
    light1.position.x = 320;
    light1.position.y = 200;
    light1.position.z = 300;
    scene.add( light2 );

    var light3 = new THREE.PointLight( 0x80ff80, 2, 1000 );
    light1.position.x = 160;
    light1.position.y = 500;
    light1.position.z = 300;
    scene.add( light3 );

    var camera = new THREE.PerspectiveCamera( 75, window.innerWidth /
                                               window.innerHeight, 0.1, 1000 );
    camera.position.z = 300;
    camera.position.y = 160;
    camera.position.x = 250;

    var renderer = new THREE.WebGLRenderer();
    renderer.setSize( window.innerWidth, window.innerHeight );

    document.body.appendChild( renderer.domElement );

    var update = function() {
        requestAnimationFrame(update);
        space.step(1/60);
        viewManager.update();
        renderer.render(scene, camera);
    };
    update();
}

})();

lander.main();
