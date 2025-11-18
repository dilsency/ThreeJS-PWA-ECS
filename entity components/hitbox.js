// imports
// base
import * as THREE from "three";
// ECS
import {EntityComponent} from "entity_component";

//
export class EntityComponentHitboxManager extends EntityComponent
{
    // bare minimum
    #params = null;

    //
    #isEnabled = null;

    // construct
    constructor(params)
    {
        super(params);
        this.#params = params;

        //
        this.#isEnabled = this.#params.isEnabled;
    }

     // lifecycle

    methodInitialize()
    {
        // assign the player's hitboxes here?
    }

    methodUpdate(timeElapsed, timeDelta)
    {
        // early return: is not enabled
        if(this.#isEnabled != true){return;}

        // get all enemy hurtboxes
        const listEntities = this.methodGetEntitiesWithComponent("EntityComponentHurtbox", this.methodGetName());
        // early return
        if(listEntities == null || listEntities == undefined || listEntities.length <= 0){return;}
        // loop through them all and compare sphere distances
        for(const iteratorEntity of listEntities)
        {
            // first the comparison
            // here we need to get the actual sphere data
            // in our own hitbox(es) and the iteratorEntity 's hurtbox
            const componentInstanceHitboxList = this.methodGetComponent("EntityComponentHitboxList");
            if(componentInstanceHitboxList == null || componentInstanceHitboxList == undefined){return;}
            const componentInstanceHurtbox = iteratorEntity.methodGetComponent("EntityComponentHurtbox");
            if(componentInstanceHurtbox == null || componentInstanceHurtbox == undefined){return;}
            // compare distances

            // we do the next step in another function for readability
            const res = this.methodUpdateHitboxIteration(listEntities, iteratorEntity, componentInstanceHitboxList, componentInstanceHurtbox);
            

        }
    }

    methodUpdateHitboxIteration(listEntities, iteratorEntity, componentInstanceHitboxList, componentInstanceHurtbox)
    {
            // since we have multiple hitboxes, we need to loop through them
            for(const iteratorHitbox of componentInstanceHitboxList.arraySpheres)
            {
                // though we should be mindful of global position
                const sphereA = new THREE.Sphere();
                sphereA.center.copy(iteratorHitbox.sphereWorldPosition);
                sphereA.radius = iteratorHitbox.sphereRadius * 2;
                const sphereB = new THREE.Sphere();
                sphereB.center.copy(componentInstanceHurtbox.sphereWorldPosition);
                sphereB.radius = componentInstanceHurtbox.sphereRadius * 2;
                const isIntersecting = sphereA.intersectsSphere(sphereB);
                // early continue: no intersection
                if(!isIntersecting)
                {
                    continue;
                }
                // but if we do intersect, then broadcast
                iteratorEntity.methodBroadcastMessage({
                    invokableHandlerName: 'battleevent.takedamage',
                    invokableHandlerValue: 0.1,
                });
                return true;
            }
            return false;
    }
}

//
export class EntityComponentHitboxList extends EntityComponent
{
    // bare minimum
    #params = null;

    //
    #arraySpheres = [];
    #arraySpheresCount = 0;
    #arraySpheresRadius = [];
    #arraySpheresPositionOffset = [];

    // construct
    constructor(params)
    {
        //
        super(params);
        this.#params = params;

        //
        this.#arraySpheresCount = this.#params.countSpheres;
        this.#arraySpheresPositionOffset = this.#params.offsetPositions;
        this.#arraySpheresRadius = this.#params.radii;
    }

    // getters

    get arraySpheres(){return this.#arraySpheres;}

    // lifecycle

    methodInitialize()
    {
        //
        for(var i = 0; i < this.#arraySpheresCount; i++)
        {
            // reminder: ... places all of the contents in #params into the object
            const s = new EntityComponentHitbox({...this.#params,offsetPosition:this.#arraySpheresPositionOffset[i],radius:this.#arraySpheresRadius[i],});
            s.methodSetParent(this);
            s.methodInitialize();
            this.#arraySpheres.push(s);
        }
        
        //
        console.log(this.methodGetName() + " has these ("+ this.#arraySpheresCount +") spheres for hitboxes:");
        console.log(this.#arraySpheres);
    }

    methodUpdate(){}
}

//
export class EntityComponentHitbox extends EntityComponent
{
    // bare minimum
    #params = null;

    //
    #sphere = null;
    #sphereRadius = 0.5;
    #sphereWorldPosition = null;
    #spherePositionOffset = {x:0,y:-1.2,z:-0.8};

    // construct
    constructor(params)
    {
        super(params);
        this.#params = params;

        //
        this.#sphereWorldPosition = new THREE.Vector3();
        this.#spherePositionOffset = this.#params.offsetPosition;
        this.#sphereRadius = this.#params.radius;
    }

    // getters

    get sphereRadius(){return this.#sphereRadius;}
    get spherePosition(){return this.#sphere.position;}
    get sphereWorldPosition(){
        this.#sphereWorldPosition.copy(this.methodGetPosition());
        this.#sphereWorldPosition.x += this.#spherePositionOffset.x;
        this.#sphereWorldPosition.y += this.#spherePositionOffset.y;
        this.#sphereWorldPosition.z += this.#spherePositionOffset.z;
        this.#sphere.localToWorld(this.#sphereWorldPosition);
        return this.#sphereWorldPosition;
    }
    get spherePositionOffset(){return this.#spherePositionOffset;}

     // lifecycle

    methodInitialize()
    {
        //
        const geometry = new THREE.SphereGeometry(this.#sphereRadius,4,4);
        const material = new THREE.MeshBasicMaterial( { color: 0xff0000, wireframe: true, } );
        this.#sphere = new THREE.Mesh( geometry, material );
        
        //
        console.log("["+ this.#params.isFixedToCamera +"] this.#params.isFixedToCamera | (parent: "+ this.methodGetName() +")");

        //
        if(this.#params.isFixedToCamera == true)
        {
            //
            this.#params.cameraPivot.add(this.#sphere);
        }
        else {
            //
            this.#params.scene.add(this.#sphere);
        }
        //
        this.methodMoveHitboxByOffset();

        // register handlers

        this.methodRegisterInvokableHandler('update.position', (paramMessage) =>{ this.methodHandleUpdatePosition(paramMessage);});
    }

    methodMoveHitboxByOffset()
    {
        //
        this.#sphere.position.x += this.#spherePositionOffset.x;
        this.#sphere.position.y += this.#spherePositionOffset.y;
        this.#sphere.position.z += this.#spherePositionOffset.z;
        //
        //this.#sphere.rotation.x += this.#capsuleRotationOffset.x;
        //this.#sphere.rotation.y += this.#capsuleRotationOffset.y;
        //this.#sphere.rotation.z += this.#capsuleRotationOffset.z;
        //this.#sphere.rotation.w += this.#capsuleRotationOffset.w;
    }

    methodUpdate(timeElapsed, timeDelta)
    {
        return;
        // move to assigned bone
        // get component perhaps? and we have stored the ID?
        if(this.#params.isFixedToCamera != true)
        {
            //
            if(this.#sphere == null){return;}
            if(this.#params.cameraPivot == null){return;}

            //
            this.#sphere.position.x = this.#params.cameraPivot.position.x;
            this.#sphere.position.y = this.#params.cameraPivot.position.y;
            this.#sphere.position.z = this.#params.cameraPivot.position.z;
            //
            //this.#sphere.rotation.x = this.#params.cameraPivot.rotation.x;
            //this.#sphere.rotation.y = this.#params.cameraPivot.rotation.y;
            //this.#sphere.rotation.z = this.#params.cameraPivot.rotation.z;
            //this.#sphere.rotation.w = this.#params.cameraPivot.rotation.w;
            //
            this.methodMoveHitboxByOffset();
        }
    }

    // handlers

    methodHandleUpdatePosition(paramMessage)
    {
        if(this.#params.isFixedToCamera != true)
        {
            this.#sphere.position.copy(paramMessage.invokableHandlerValue);
            this.methodMoveHitboxByOffset();
        }
    }
}


//
export class EntityComponentHurtbox extends EntityComponent
{
    // bare minimum
    #params = null;

    //
    #sphere = null;
    #sphereRadius = 0.5;
    #sphereWorldPosition = null;
    #spherePositionOffset = {x:0,y:-1.2,z:-0.8};

    // construct
    constructor(params)
    {
        super(params);
        this.#params = params;

        this.#sphereWorldPosition = new THREE.Vector3();
    }

    // getters

    get sphereRadius(){return this.#sphereRadius;}
    get spherePosition(){return this.#sphere.position;}
    get sphereWorldPosition(){this.#sphereWorldPosition.copy(this.methodGetPosition()); this.#sphere.localToWorld(this.#sphereWorldPosition);return this.#sphereWorldPosition;}
    get spherePositionOffset(){return this.#spherePositionOffset;}

    // lifecycle

    methodInitialize()
    {
        // we check if we are a player-type
        const componentInstanceHitbox = this.methodGetComponent("EntityComponentPlayerController");
        const isPlayer = (componentInstanceHitbox == null ? false : true);

        //
        const geometry = new THREE.SphereGeometry(0.5,4,4);
        const material = new THREE.MeshBasicMaterial( { color: 0xffff00, wireframe: true, visible: !isPlayer, } );
        this.#sphere = new THREE.Mesh( geometry, material );

        //
        this.#params.scene.add(this.#sphere);

        // register handlers

        this.methodRegisterInvokableHandler('update.position', (paramMessage) =>{ this.methodHandleUpdatePosition(paramMessage);});
        this.methodRegisterInvokableHandler('battleevent.takedamage', (paramMessage) =>{ this.methodHandleTakeDamage(paramMessage);});
    }

    methodUpdate()
    {}

    // handlers

    methodHandleUpdatePosition(paramMessage)
    {
        this.#sphere.position.copy(paramMessage.invokableHandlerValue);
    }

    methodHandleTakeDamage(paramMessage)
    {
        //console.log("dmg!!!");
        //console.log(paramMessage.invokableHandlerValue);
        const a = new THREE.Vector3();
        a.copy(this.methodGetPosition());
        a.y += 0.1;
        this.methodSetPosition(a);
    }
}