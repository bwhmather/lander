require.config({
    baseUrl: "/src"
});


deps = ["util/viewport", "util/keyboard", "util/view",
        "lander", "control/keyboard", "view/lander"]
require(deps, function() {
'use strict';

var imports = {};
for (var i=0; i<deps.length; i++) {
    imports[deps[i]] = arguments[i];
}

var main = function()
{
    console.log("running");
    var space = new cp.Space();
    var scene = new THREE.Scene();

    var viewManager = new imports["util/view"].ViewManager(scene);

    //space.iterations = 30;
    space.gravity = cp.v(0, -5);

    space.sleepTimeThreshold = 0.5;
    space.collisionSlop = 0.5;


    var floor = space.addShape(new cp.SegmentShape(
            space.staticBody,
            cp.v(-640, 0), cp.v(640, 0), 0)
    );
    floor.setElasticity(1);
    floor.setFriction(1);

    var lander = new imports["lander"].Lander(space, cp.v(0, 10));

    lander.controller = new imports["control/keyboard"].KeyboardController(
            new imports["util/keyboard"].KeyboardTracker());

    var landerView = new imports["view/lander"].LanderView(scene, lander);
    viewManager.addView(landerView);

	scene.add( new THREE.AmbientLight(0x000000));

    var sun = new THREE.PointLight( 0xaaaa99, 2, 1000 );
    sun.position.x = 100;
    sun.position.y = 200;
    sun.position.z = 300;
    scene.add(sun);

    var camera = new THREE.PerspectiveCamera(40, window.innerWidth /
                                                 window.innerHeight, 0.1, 1000);
    camera.position.x = 0;
    camera.position.y = 3;
    camera.position.z = 10;

    var renderer = new THREE.WebGLRenderer({"antialias": true});

    document.body.appendChild( renderer.domElement );

    var resizer = new imports["util/viewport"].ViewportResizer(camera, renderer);


    var update = function() {
        requestAnimationFrame(update);
        space.step(1/60);
        lander.update();
        viewManager.update();
        renderer.render(scene, camera);
    };
    update();
}

main();
});

