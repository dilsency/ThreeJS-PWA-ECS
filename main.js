// imports
// base
import * as THREE from "three";
// entity-component-system (ECS)
import {EntityManager} from "entity_manager";
import {Entity} from "entity";
import {EntityComponent} from "entity_component";
// entity components
import {EntityComponentCameraControllerFirstPerson} from "camera";
import {EntityComponentCameraControllerFirstPersonInput} from "camera";
import {EntityComponentPlayerController} from "player";
import {EntityComponentPlayerControllerInput} from "player";
import {EntityComponentTestCube} from "./entity components/test_objects.js";
import {EntityComponentButtonPointerLock} from "./entity components/test_objects.js";

// bare minimum
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

// ECS
var entityManager;

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
        renderer.domElement.id = "canvas";
        document.body.appendChild( renderer.domElement );
    }

    //
    function initECS()
    {
        //
        console.log("init ECS");

        //
        entityManager = new EntityManager(null);
    }

    //
    function initEntityComponents()
    {
        //
        console.log("init Entities");

        //
        const entityA = new Entity(null);
        //
        entityA.methodAddComponent(new EntityComponentCameraControllerFirstPerson({scene: scene, camera: camera, cameraPivot: cameraPivot,}));
        entityA.methodAddComponent(new EntityComponentCameraControllerFirstPersonInput());
        //
        entityA.methodAddComponent(new EntityComponentPlayerController({cameraPivot: cameraPivot,}));
        entityA.methodAddComponent(new EntityComponentPlayerControllerInput());

        //
        entityManager.methodAddEntity(entityA);

        //
        const entityB = new Entity(null);
        entityB.methodAddComponent(new EntityComponentTestCube({scene:scene,}));
        entityManager.methodAddEntity(entityB);

        //
        const entityC = new Entity(null);
        entityC.methodAddComponent(new EntityComponentButtonPointerLock({document:document,renderer:renderer,}));
        entityManager.methodAddEntity(entityC);
    }

    //
    initBareMinimum();

    //
    initECS();
    initEntityComponents();

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

    // https://threejs.org/manual/#en/responsive
    updateWindowSize();

    //
    updateEntityComponents();

    // must be last
    renderer.render(scene, camera);
}

function resizeRendererToMatchDisplaySize(renderer)
{
    const canvas = renderer.domElement;
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    const needResize = canvas.width !== width || canvas.height !== height;
    if (needResize) {
        renderer.setSize(width, height, false);
    }
    return needResize;
}

function updateWindowSize()
{
    if(resizeRendererToMatchDisplaySize(renderer))
    {
        const canvas = renderer.domElement;
        camera.aspect = canvas.clientWidth / canvas.clientHeight;
        camera.updateProjectionMatrix();
    }
}

function updateEntityComponents()
{
    entityManager.methodUpdate(clockTimeElapsed, clockTimeDelta);
}