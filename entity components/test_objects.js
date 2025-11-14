// imports
// base
import * as THREE from "three";
// ECS
import {EntityComponent} from "entity_component";

//
export class EntityComponentTestCube extends EntityComponent
{
    // bare minimum
    #params = null;

    //
    #cube = null;

    // construct
    constructor(params)
    {
        super(params);
        this.#params = params;
    }

     // lifecycle

    methodInitialize()
    {
        const geometry = new THREE.BoxGeometry( 1, 1, 1 );
        const material = new THREE.MeshBasicMaterial( { color: 0x00ff00, wireframe: true, } );
        this.#cube = new THREE.Mesh( geometry, material );
        this.#params.scene.add(this.#cube);
    }

    methodUpdate(timeElapsed, timeDelta)
    {
        this.#cube.rotation.y += timeDelta;
    }
}

//
export class EntityComponentButtonPointerLock extends EntityComponent
{
    // bare minimum
    #params = null;

    //
    #elementButton = null;
    #isVisibleButton = true;

    // construct
    constructor(params)
    {
        super(params);
        this.#params = params;
    }

     // lifecycle

    methodInitialize()
    {
        //
        this.#params.document.addEventListener("pointerlockchange", this.methodOnPointerLockChange, false);
        this.#params.document.addEventListener("pointerlockerror", this.methodOnPointerLockError, false);

        //
        this.#elementButton = this.#params.document.createElement("button");
        this.#elementButton.innerText = "hello there";
        this.#elementButton.style.position = "fixed";
        this.#elementButton.style.top = "0";
        this.#elementButton.style.left = "0";
        this.#elementButton.addEventListener("click", ((e) => this.methodOnClickButton(e)));
        this.#params.document.body.appendChild(this.#elementButton);
    }

    methodUpdate(timeElapsed, timeDelta)
    {
    }

    //

    async methodOnClickButton(e)
    {
        if(this.#isVisibleButton == true)
        {
            this.#isVisibleButton = false;
            this.#elementButton.style.display = "none";
            await this.#params.renderer.domElement.requestPointerLock();
        }
        else if(this.#isVisibleButton == false)
        {
            this.#isVisibleButton = true;
            this.#elementButton.style.display = "block";
        }
    }

    methodOnPointerLockChange(e)
    {

    }
    methodOnPointerLockError(e)
    {
        
    }
}
