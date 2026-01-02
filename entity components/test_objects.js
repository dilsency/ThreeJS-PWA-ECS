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
    #positionOffset = {x:0,y:0,z:0};

    // construct
    constructor(params)
    {
        super(params);
        this.#params = params;

        //
        if(params.positionOffset != null)
        {
            this.#positionOffset = params.positionOffset;
        }
    }

     // lifecycle

    methodInitialize()
    {
        const geometry = new THREE.BoxGeometry( 1, 1, 1 );
        const material = new THREE.MeshBasicMaterial( { color: 0x00ff00, wireframe: true, } );
        this.#cube = new THREE.Mesh( geometry, material );
        this.#params.scene.add(this.#cube);

        //
        this.#cube.position.x += this.#positionOffset.x;
        this.#cube.position.y += this.#positionOffset.y;
        this.#cube.position.z += this.#positionOffset.z;

        // register handlers

        this.methodRegisterInvokableHandler('update.position', (paramMessage) =>{ this.methodHandleUpdatePosition(paramMessage);});
    }

    methodUpdate(timeElapsed, timeDelta)
    {
        //this.#cube.rotation.y += timeDelta;
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
        this.#elementButton.style.bottom = "0";
        this.#elementButton.style.left = "calc(50% - 45px)";
        this.#elementButton.style.right = "calc(50% - 45px)";
        this.#elementButton.style.width = "90px";
        this.#elementButton.style.fontSize = "11px";
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
export class EntityComponentButtonCouldToDo extends EntityComponent
{

    // bare minimum
    #params = null;

    //
    #elementUnorderedList = null;
    #elementButton = null;
    #stateToggle = false;

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
        this.#elementButton = this.#params.document.createElement("button");
        this.#elementButton.innerText = "things that we Could do";
        this.#elementButton.style.position = "fixed";
        this.#elementButton.style.top = "0";
        this.#elementButton.style.left = "0";
        this.#elementButton.style.fontSize = "11px";
        this.#elementButton.addEventListener("click", ((e) => this.methodOnClickButton(e)));
        this.#params.document.body.appendChild(this.#elementButton);

        //
        this.#elementUnorderedList = this.#params.document.createElement("ul");

        this.#elementUnorderedList.style.display = "none";
        this.#elementUnorderedList.style.position = "fixed";
        this.#elementUnorderedList.style.top = "20px";
        this.#elementUnorderedList.style.left = "0";

        this.#elementUnorderedList.style.color = "#FFFFFF";
        this.#elementUnorderedList.style.maxWidth = "200px";
        this.#elementUnorderedList.style.fontSize = "11px";
        this.#elementUnorderedList.style.userSelect = "none";
        this.#elementUnorderedList.style.marginLeft = "15px";
        this.#elementUnorderedList.style.paddingLeft = "0";

        this.#params.document.body.appendChild(this.#elementUnorderedList);

        // https://math.stackexchange.com/questions/3539667/closest-point-on-a-cylinder-from-a-point
        const li1 = this.#params.document.createElement("li");
        li1.innerText = "still use spheres only for hitbox detection. BUT. we could also check inbetween the spheres, with a crude 'cylinder-like' approach. \n we could search in the Explorer for cylinder/capsule, I think we've done that before...";
        this.#elementUnorderedList.appendChild(li1);

        //
        const li2 = this.#params.document.createElement("li");
        li2.innerText = "in that case though... we would need a ListList class, that contains the now List class. \n this is so that we can have separate hitboxes that are also NOT part of a chain like that.";
        this.#elementUnorderedList.appendChild(li2);

        //
        const li3 = this.#params.document.createElement("li");
        li3.innerText = "change so that we check all hitbox handlers whenever a hitbox updates. \n currently we only check ourselves, and update our own lines, when we should update other entities' lines as well.";
        this.#elementUnorderedList.appendChild(li3);
    }

    methodUpdate(timeElapsed, timeDelta)
    {
    }

    //

    async methodOnClickButton(e)
    {
        if(this.#stateToggle == true)
        {
            this.#stateToggle = false;
            //this.#elementButton.style.display = "block";
            this.#elementUnorderedList.style.display = "none";
        }
        else {
            this.#stateToggle = true;
            //this.#elementButton.style.display = "none";
            this.#elementUnorderedList.style.display = "block";
        }
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

        //
        const clamp = 0.01;
        var displacement = Math.sin(timeElapsed * 1) * 1.0;
        if(displacement > clamp){displacement = clamp;}
        else if (displacement < -clamp){displacement = -clamp;}

        //
        pos.x += displacement;
        this.methodSetPosition(pos);
    }
}

//
export class EntityComponentGravity extends EntityComponent
{
    // bare minimum
    #params = null;

    //
    #velocity = null;
    #isEnabled = false;

    //
    #velocityMax = 0.08;

    // construct
    constructor(params)
    {
        super(params);
        this.#params = params;

        //
        this.#velocity = new THREE.Vector3(0,0.05,0);
        this.#isEnabled = params.isEnabled;
    }

    // lifecycle

    methodInitialize()
    {
        this.methodRegisterInvokableHandler('battleevent.takedamage', (paramMessage) =>{ this.methodHandleTakeDamage(paramMessage);});
    }

    methodUpdate(timeElapsed, timeDelta)
    {
        // early return: not enabled
        if(this.#isEnabled != true){return;}

        //
        this.#methodIncreaseVelocity();
        this.#methodApplyVelocity();
    }

    // helpers

    #methodIncreaseVelocity()
    {
        //
        const pos = new THREE.Vector3();
        pos.copy(this.methodGetPosition());

        //
        if(pos.y >= 0)
        {
            this.#velocity.y -= 0.001;
        }
        if(pos.y < 0)
        {
            this.#velocity.y = Math.abs(this.#velocity.y);
            this.#velocity.y *= 0.9;
        }

        // clamp
        this.#methodClampVelocity();
    }
    #methodApplyVelocity()
    {
        //
        const pos = new THREE.Vector3();
        pos.copy(this.methodGetPosition());

        //
        pos.y += this.#velocity.y;
        this.methodSetPosition(pos);
    }

    #methodClampVelocity()
    {
        if(this.#velocity.y > this.#velocityMax)
        {
            this.#velocity.y = this.#velocityMax;
        }
        else if(this.#velocity.y < -(this.#velocityMax))
        {
            this.#velocity.y = -(this.#velocityMax);
        }
    }

    // handlers

    methodHandleTakeDamage(paramMessage)
    {
        //
        this.#velocity.y += 0.05;

        // clamp
        this.#methodClampVelocity();
    }
}