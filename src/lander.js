define("lander", [], function(){
'use strict';

var exports = {};


var Lander = exports.Lander = function(space, pos)
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

return exports;
});
