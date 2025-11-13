// base
import * as THREE from "three";

//
var scene;
var renderer;

var clock;
var clockTimeDelta = 0;
var clockTimeElapsed = 0;

var cameraPivot;
var camera;

var cameraDirection;
var cameraPivotDirection;
var cameraFrustum;

//
var cube;

//
init();
function init()
{
    //
    function initBareMinimum()
    {
        //
        console.log("init bare minimum");

        //
        clock = new THREE.Clock();
        clock.start();

        //
        scene = new THREE.Scene();
        scene.environment = null;

        //
        cameraPivot = new THREE.Object3D();
        cameraPivot.name = "cameraPivot";
        cameraPivot.position.z = 5;
        scene.add(cameraPivot);
        camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );

        //
        camera.up.set(0,1,0);

        camera.updateProjectionMatrix();
        cameraPivot.add(camera);
        cameraDirection = new THREE.Vector3();
        cameraPivotDirection = new THREE.Vector3();
        cameraFrustum = new THREE.Frustum();
        
        // default cam values
        camera.getWorldDirection(cameraDirection);
        cameraPivot.getWorldDirection(cameraPivotDirection);
        cameraFrustum.setFromProjectionMatrix(camera.projectionMatrix);

        //
        renderer = new THREE.WebGLRenderer();
        renderer.setSize( window.innerWidth, window.innerHeight );
        document.body.appendChild( renderer.domElement );
    }

    //
    function initECS()
    {
        //
        console.log("init ECS");
    }

    //
    function initEntities()
    {
        //
        console.log("init Entities");

        //
        const geometry = new THREE.BoxGeometry( 1, 1, 1 );
        const material = new THREE.MeshBasicMaterial( { color: 0x00ff00, wireframe: true, } );
        cube = new THREE.Mesh( geometry, material );
        scene.add( cube );
    }

    //
    initBareMinimum();
    initECS();

    //
    initEntities();

    //
    update();
}

function update()
{
    // must be first
    requestAnimationFrame((t) => {
        update();
      });

    //
    clockTimeDelta = clock.getDelta();
    clockTimeElapsed = clock.getElapsedTime();

    //
    updateEntities();

    // must be last
    renderer.render(scene, camera);
}

function updateEntities()
{
    cube.rotation.y += 0.008;
}