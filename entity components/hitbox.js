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

    // testing
    #hasInitializedLines = false;
    #lines = [];
    #linesPoints = [];
    #linesPointsInitial = [];
    #hasRanOnce = false;

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

        // register handlers

        this.methodRegisterInvokableHandler('update.position', (paramMessage) =>{ this.methodHandleUpdatePosition(paramMessage);});
    }

    methodUpdate(timeElapsed, timeDelta)
    {
        // early return: is not enabled
        if(this.#isEnabled != true){return;}

        // get all enemy hurtboxes
        const listEntities = this.methodGetEntitiesWithComponent("EntityComponentHurtbox", this.methodGetName());
        // early return
        if(listEntities == null || listEntities == undefined || listEntities.length <= 0){return;}

        // we only need to get our own component once (it doesn't depend on the loop)
        const componentInstanceHitboxList = this.methodGetComponent("EntityComponentHitboxList");
        if(componentInstanceHitboxList == null || componentInstanceHitboxList == undefined){return;}

        // loop through them all and compare sphere distances
        for(const iteratorEntity of listEntities)
        {
            // first the comparison
            // here we need to get the actual sphere data
            // in our own hitbox(es) and the iteratorEntity 's hurtbox
            const componentInstanceHurtbox = iteratorEntity.methodGetComponent("EntityComponentHurtbox");
            if(componentInstanceHurtbox == null || componentInstanceHurtbox == undefined){continue;}
            // compare distances

            // we do the next step in another function for readability
            const res = this.methodUpdateHitboxIteration(listEntities, iteratorEntity, componentInstanceHitboxList, componentInstanceHurtbox);
            

        }
    }

    // handlers

    methodHandleUpdatePosition(paramMessage)
    {
        //
        /*
        console.log(" ");
        console.log("our lines points:");
        console.log(this.#linesPoints[0]);
        console.log(paramMessage.invokableHandlerValue);
        */
        //this.methodUpdatePositionLines(paramMessage);
        for(var i = 0; i < this.#lines.length; i++)
        {
            this.#linesPoints[i][0].x = paramMessage.invokableHandlerValue.x + this.#linesPointsInitial[i][0].x;
            this.#linesPoints[i][0].y = paramMessage.invokableHandlerValue.y + this.#linesPointsInitial[i][0].y;
            this.#linesPoints[i][0].z = paramMessage.invokableHandlerValue.z + this.#linesPointsInitial[i][0].z;
            this.#lines[i].geometry.setFromPoints(this.#linesPoints[i]);
        }
    }

    // other

    methodInitializeLines()
    {
        // this is called manually from main.js
        // this is because we actually need all objects to be initialized on the scene FIRST
        // before we can draw anything

        console.log(this.methodGetName());
        console.log("init lines");

        // early return: we have already initialized
        if(this.#hasInitializedLines == true){return;}

        // get all enemy hurtboxes
        const listEntities = this.methodGetEntitiesWithComponent("EntityComponentHurtbox", this.methodGetName());
        // early return
        if(listEntities == null || listEntities == undefined || listEntities.length <= 0){return;}

        // we only need to get our own component once (it doesn't depend on the loop)
        const componentInstanceHitboxList = this.methodGetComponent("EntityComponentHitboxList");
        if(componentInstanceHitboxList == null || componentInstanceHitboxList == undefined){return;}

        // loop through them all and compare sphere distances
        for(const iteratorEntity of listEntities)
        {
            // first the comparison
            // here we need to get the actual sphere data
            // in our own hitbox(es) and the iteratorEntity 's hurtbox
            const componentInstanceHurtbox = iteratorEntity.methodGetComponent("EntityComponentHurtbox");
            if(componentInstanceHurtbox == null || componentInstanceHurtbox == undefined){continue;}
            // compare distances

            // we do the next step in another function for readability
            const res = this.methodInitializeLinesIteration(listEntities, iteratorEntity, componentInstanceHitboxList, componentInstanceHurtbox);
        }

        // end: everything seems to be ok
        console.log("our lines:");
        console.log(this.#lines);
        this.#hasInitializedLines = true;
    }

    methodInitializeLinesIteration(listEntities, iteratorEntity, componentInstanceHitboxList, componentInstanceHurtbox)
    {
        for(const iteratorHitbox of componentInstanceHitboxList.arraySpheres)
        {
            const material = new THREE.LineBasicMaterial( { color: 0x0000ff, side: THREE.DoubleSide, } );
            const points = [];
            //points.push(new THREE.Vector3().copy(iteratorHitbox.sphereWorldPosition));
            //points.push(new THREE.Vector3().copy(componentInstanceHurtbox.sphereWorldPosition));
            points.push(new THREE.Vector3().copy(iteratorHitbox.sphereWorldPosition));
            points.push(new THREE.Vector3().copy(componentInstanceHurtbox.sphereWorldPosition));
            console.log(points);
            const geometry = new THREE.BufferGeometry().setFromPoints( points );
            const line = new THREE.Line( geometry, material );
            this.#params.scene.add(line);
            this.#lines.push(line);
            this.#linesPoints.push(points);
            this.#linesPointsInitial.push(points);
        }
    }

    methodUpdatePositionLines(paramMessage)
    {
        // early return: we have no lines, no need to update them
        if(this.#lines.length <= 0){return;}

        // get all enemy hurtboxes
        const listEntities = this.methodGetEntitiesWithComponent("EntityComponentHurtbox", this.methodGetName());
        // early return
        if(listEntities == null || listEntities == undefined || listEntities.length <= 0){return;}

        // we only need to get our own component once (it doesn't depend on the loop)
        const componentInstanceHitboxList = this.methodGetComponent("EntityComponentHitboxList");
        if(componentInstanceHitboxList == null || componentInstanceHitboxList == undefined){return;}

        // loop through them all and compare sphere distances
        for(const iteratorEntity of listEntities)
        {
            // first the comparison
            // here we need to get the actual sphere data
            // in our own hitbox(es) and the iteratorEntity 's hurtbox
            const componentInstanceHurtbox = iteratorEntity.methodGetComponent("EntityComponentHurtbox");
            if(componentInstanceHurtbox == null || componentInstanceHurtbox == undefined){continue;}
            // compare distances

            // we do the next step in another function for readability
            const res = this.methodUpdatePositionLinesIteration(paramMessage, listEntities, iteratorEntity, componentInstanceHitboxList, componentInstanceHurtbox);
        }
    }

    methodUpdatePositionLinesIteration(paramMessage, listEntities, iteratorEntity, componentInstanceHitboxList, componentInstanceHurtbox)
    {
        var index = 0;
        for(const iteratorHitbox of componentInstanceHitboxList.arraySpheres)
        {
            const points = [];
            points.push(new THREE.Vector3().copy(iteratorHitbox.sphereWorldPosition));
            points.push(new THREE.Vector3().copy(componentInstanceHurtbox.sphereWorldPosition));
            this.#lines[index].geometry.setFromPoints( points );
            index++;
        }
        index = 0;
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
                if(this.#hasRanOnce != true)
                {
                    console.log(" ");
                    console.log("hitbox (us ourselves) first:");
                    console.log("entity position :");
                    console.log(this.methodGetPosition());

                    console.log("sphereA.center :");
                    console.log(sphereA.center);
                    console.log("["+ sphereA.radius +"] sphereA.radius");

                    console.log(" ");
                    console.log("hurtbox (anyone else) second:");
                    console.log("entity position :");
                    console.log(iteratorEntity.methodGetPosition());

                    console.log("sphereB.center :");
                    console.log(sphereB.center);
                    console.log("["+ sphereB.radius +"] sphereB.radius");

                    console.log(" ");
                    console.log("distance between centers:");
                    console.log(sphereA.distanceToPoint(sphereB.center));

                    this.#hasRanOnce = true;
                }
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
        if(this.#params.isFixedToCamera == true){return;}

        this.#sphere.position.copy(paramMessage.invokableHandlerValue);
        //this.#sphere.position.copy(this.methodGetPosition());
        this.methodMoveHitboxByOffset();


        // how to handle rotations?
        // we are not currently a child of the camera, mind you

        // one idea is to google threejs rotate around point

        // another is:
        // have a fake test point as a child from the camera
        // rotate around the player
        // and then just copy that position?
    }

    // other

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