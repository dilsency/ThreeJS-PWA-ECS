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

        // register handlers

        this.methodRegisterInvokableHandler('update.position', (paramMessage) =>{ this.methodHandleUpdatePosition(paramMessage);});
    }

    methodUpdate(timeElapsed, timeDelta)
    {
        this.#cube.rotation.y += timeDelta;
    }

    // handlers

    methodHandleUpdatePosition(paramMessage)
    {
        this.#cube.position.copy(paramMessage.invokableHandlerValue);
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
        this.#params.document.addEventListener("pointerlockchange", this.methodOnPointerLockChange.bind(this), false);
        this.#params.document.addEventListener("pointerlockerror", this.methodOnPointerLockError.bind(this), false);

        //
        this.#elementButton = this.#params.document.createElement("button");
        this.#elementButton.innerText = "PointerLock";
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
        await this.#params.renderer.domElement.requestPointerLock();
    }

    methodOnPointerLockChange(e)
    {
        //
        const res = this.methodGetIsPointerLocked();
        if(!res)
        {
            this.#isVisibleButton = true;
            this.#elementButton.style.display = "block";
        }
        else {
            this.#isVisibleButton = false;
            this.#elementButton.style.display = "none";
        }
    }
    methodOnPointerLockError(e)
    {
        
    }

    methodGetIsPointerLocked()
    {
        const res = (this.#params.document.pointerLockElement == null || this.#params.document.pointerLockElement == undefined || this.#params.document.pointerLockElement !== this.#params.renderer.domElement);

        return !res;
    }
}

//
export class EntityComponentAIEnemy extends EntityComponent
{
    // bare minimum
    #params = null;

    //
    #isEnabled = false;

    // construct
    constructor(params)
    {
        super(params);
        this.#params = params;

        //
        this.#isEnabled = params.isEnabled;
    }

    // lifecycle

    methodInitialize(){}

    methodUpdate(timeElapsed, timeDelta)
    {
        // early return: not enabled
        if(this.#isEnabled != true){return;}

        //
        const pos = new THREE.Vector3();
        pos.copy(this.methodGetPosition());
        pos.x += Math.sin(timeElapsed * 5) * 0.1;
        this.methodSetPosition(pos);
    }
}