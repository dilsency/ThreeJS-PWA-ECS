// imports
// base
import * as THREE from "three";
// ECS
import {EntityComponent} from "entity_component";
//
import { rotateObjectAboutPoint, setRotationOfObjectAboutPoint } from "../helpers/helper_rotation.js";

//
export class EntityComponentHitboxManager extends EntityComponent
{
    // bare minimum
    #params = null;

    //
    #isEnabled = null;
    // test only
    #isTestDisableInUpdateLoop = true;

    // testing
    #hasInitializedLines = false;
    #lines = [];
    #linesPoints = [];
    #linesPointsInitial = [];
    #linesDistances = [];
    #hasRanOnce = false;

    //
    #timeDeltaCounter = 1 / 2;
    #timeDeltaCounterMax = 1 / 2;

    // construct
    constructor(params)
    {
        super(params);
        this.#params = params;

        //
        this.#isEnabled = this.#params.isEnabled;
    }

    // getters

    get hasLines(){return (this.#hasInitializedLines == true);}

     // lifecycle

    methodInitialize()
    {
        // assign the player's hitboxes here?

        // register handlers

        this.methodRegisterInvokableHandler('update.position', (paramMessage) =>{ this.methodHandleUpdatePosition(paramMessage);});
        this.methodRegisterInvokableHandler('update.rotations', (paramMessage) =>{ this.methodHandleUpdateRotations(paramMessage);});
        this.methodRegisterInvokableHandler('update.distances', (paramMessage) =>{ this.methodHandleUpdateDistances(paramMessage);});
    }

    methodUpdate(timeElapsed, timeDelta)
    {
        // early return: is not enabled
        if(this.#isEnabled != true){return;}
        // early return: test by disable update in loop
        if(this.#isTestDisableInUpdateLoop == true){return;}

        // sphere aka hithurtbox aka both hitboxes and hurtboxes
        this.methodUpdateSphere(timeDelta);
    }
    methodUpdateSphere(timeDelta)
    {
        // begin throttle
        this.#timeDeltaCounter += timeDelta;
        if(this.#timeDeltaCounter < this.#timeDeltaCounterMax){return;}
        this.#timeDeltaCounter = 0;
        // end throttle

        // y'all we have to do so many loops
        // since we start at the top-top level
        // and we need to go to the bottom (hehe) twice

        // we have our single hitboxlistlist containing multiple hitboxlist containing multiple hitbox
        // for each hitbox there
        // we need to get multiple entities with hurtboxlistlist containing multiple hurtboxlist containing multiple hurtbox

        // that's so much!!!


        // our index variable
        // keeps track of which line we are on
        // we could technically use normal for loops and just use our iteratorIndex
        // BUT that is harder to read, actually
        var index = 0;

        // let's start with ourselves, and our attacking hitboxes
        const l1 = this.methodGetComponent("EntityComponentHitboxListList");if(l1 == null){return;}
        for(const i1 of l1.twoDimArraySpheres)
        {
            for(const i2 of i1.arraySpheres)
            {
                // we have finished looping over attacking hitboxes
                // now we START looping over defending hurtboxes
                const e1 = this.methodGetEntitiesWithComponent("EntityComponentHurtboxListList", this.methodGetName());
                for(const j1 of e1)
                {
                    const c1 = j1.methodGetComponent("EntityComponentHurtboxListList");
                    for(const j2 of c1.twoDimArraySpheres)
                    {
                        for(const j3 of j2.arraySpheres)
                        {
                            // we now have both attacking hitbox and defending hurtbox
                            this.methodUpdateSphere2(i2,j3,index);
                            index++;
                        }
                        //index++;
                    }
                    //index++;
                }
                //index++;
            }
            //index++;
        }

        //console.log(this.#lines.length);
    }
    methodUpdateSphere2(componentHitbox, componentHurtbox, index)
    {
        const dist = this.methodGetDistanceSphere(componentHitbox, componentHurtbox, index);
        this.#linesDistances[index] = (dist);
        const res = this.methodUpdateOrCreateLine(componentHitbox, componentHurtbox, index, dist);
    }
    methodGetDistanceSphere(componentHitbox, componentHurtbox, index)
    {
        var dist = 0;
        dist = componentHitbox.spherePositionAfterRotation.distanceTo(componentHurtbox.spherePositionAfterRotation);
        return dist;
    }
    methodUpdateOrCreateLine(componentHitbox, componentHurtbox, index, dist)
    {
            // to do
            // index should definitely not be a simple integer
            // we should first have a level where the key is the unique name of the enemy entity
            // (since we ourselves are the attacker, we don't need to store our own name)
            // and then inside that can we have the other array, or multiple


            
            //
            const points = [
                new THREE.Vector3(0,0,0),
                new THREE.Vector3(0,0,0),
            ];
            // this part is easy
            // : our own hitbox
            points[1].copy(componentHitbox.spherePositionAfterRotation);
            // this is the part that doesn't want to work
            // : the enemy hurtbox
            //points[0].copy(componentHurtbox.spherePositionAfterRotation);
            points[0].copy(componentHurtbox.spherePosition);

            // if we do not have a line here, init it
            if(this.#lines[index] == null || this.#lines[index] == undefined)
            {
                this.methodCreateLine(index, points);
            }

            this.#lines[index].geometry.setFromPoints(points);
            this.#lines[index].geometry.computeBoundingSphere();
            
            // based on distance we change the color
            const col1 = new THREE.Color(0xFF0000);
            const col2 = new THREE.Color(0x0000FF);
            const col3 = new THREE.Color(0xFFFF00);

            // is dist not in absolutes or smn? it doesn't seem to register when rotating and then on the other side?
            
            const maxdist1 = (componentHitbox.sphereRadius * 1.1 + componentHurtbox.sphereRadius * 1.1);
            const maxdist2 = (componentHitbox.sphereRadius * 4.1 + componentHurtbox.sphereRadius * 4.1);

            if(dist <= maxdist1)
            {
                col1.setColorName("cyan");
            }
            else if(dist <= maxdist2)
            {
                col3.lerp(col1, dist / maxdist2);
                col1.copy(col3);
            }
            else {
                col1.lerp(col2, ((dist - maxdist2) / maxdist2));
            }
            this.#lines[index].material.color.set(col1.r, col1.g, col1.b);
            //
    }
    methodCreateLine(index, points)
    {
        const material = new THREE.LineBasicMaterial( { color: 0x0000ff, side: THREE.DoubleSide, depthTest: false, } );
        const geometry = new THREE.BufferGeometry();
        const line = new THREE.Line( geometry, material );
        //
        this.#lines[index] = line;
        this.#linesPoints[index] = points;
        this.#linesPointsInitial[index] = points;
        this.#linesDistances[index] = 0;//Math.abs(points[0].distanceTo(points[1]));
        //
        this.#params.scene.add(line);
    }

    // handlers

    methodHandleUpdatePosition(paramMessage)
    {
        // to do
        // update the distances / lines of all components that have a hitbox manager

        //

                // dilstest test
                // disable update lines for now
                // we should instead call for all entities with a hitbox manager
                // and do that in a loop there
                //
                // I mean why not make that a message, then? and subscribe to it in the hitbox manager?
                // or wait, that wouldn't go out to all entities... would it?
        //this.methodUpdatePositionLines(paramMessage);
                this.methodUpdateDistancesForAllHitboxManagers(paramMessage);
    }
    methodHandleUpdateRotations(paramMessage)
    {
        //
        // dilstest test
        // disable update lines for now
        // we should instead call for all entities with a hitbox manager
        // and do that in a loop there
        //
        // I mean why not make that a message, then? and subscribe to it in the hitbox manager?
        // or wait, that wouldn't go out to all entities... would it?
        //this.methodUpdatePositionLines(paramMessage);
        this.methodUpdateDistancesForAllHitboxManagers(paramMessage);
    }

    methodHandleUpdateDistances(paramMessage)
    {
        this.methodUpdateSphere(this.#timeDeltaCounterMax);
        return;
        this.methodUpdatePositionLines(paramMessage);
    }

    // other

    methodInitializeLines()
    {
        // this isn't ran anymore lmao
        return;

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
        console.log("["+ this.#hasInitializedLines +"] .#hasInitializedLines");
        console.log("["+ this.hasLines +"] .hasLines");
    }

    methodInitializeLinesIteration(listEntities, iteratorEntity, componentInstanceHitboxList, componentInstanceHurtbox)
    {
        for(const iteratorHitbox of componentInstanceHitboxList.arraySpheres)
        {
            const material = new THREE.LineBasicMaterial( { color: 0x0000ff, side: THREE.DoubleSide, depthTest: false, } );
            const points = [];
            //points.push(new THREE.Vector3().copy(iteratorHitbox.sphereWorldPosition));
            //points.push(new THREE.Vector3().copy(componentInstanceHurtbox.sphereWorldPosition));
            points.push(new THREE.Vector3().copy(iteratorHitbox.sphereWorldPosition));
            points.push(new THREE.Vector3().copy(componentInstanceHurtbox.sphereWorldPosition));
            console.log(points);
            const geometry = new THREE.BufferGeometry().setFromPoints(points);
            // each time we call setFromPoints we recompute bounding sphere
            geometry.computeBoundingSphere();
            const line = new THREE.Line( geometry, material );
            //line.frustumCulled = false;
            this.#params.scene.add(line);
            this.#lines.push(line);
            this.#linesPoints.push(points);
            this.#linesPointsInitial.push(points);
            this.#linesDistances.push(Math.abs(points[0].distanceTo(points[1])));
        }
    }

    methodUpdatePositionLines(paramMessage)
    {
        // hmm
        // we SHOULD pre-calculate all distances, regardless of wether we have lines or not

        // early return: we have no lines, no need to update them
        //if(this.#lines.length <= 0){return;}

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
            const points = [
                new THREE.Vector3(0,0,0),
                new THREE.Vector3(0,10,0),
            ];
            // this part is easy
            // : our own hitbox
            points[1].copy(iteratorHitbox.spherePositionAfterRotation);
            // this is the part that doesn't want to work
            // : the enemy hurtbox
            //points[0].copy(componentInstanceHurtbox.spherePositionAfterRotation);
            points[0].copy(componentInstanceHurtbox.spherePosition);

            // if we do not have a line here, init it
            if(this.#lines[index] == null || this.#lines[index] == undefined)
            {
                const material = new THREE.LineBasicMaterial( { color: 0x0000ff, side: THREE.DoubleSide, depthTest: false, } );
                const geometry = new THREE.BufferGeometry();
                const line = new THREE.Line( geometry, material );
                //
                this.#lines[index] = line;
                this.#linesPoints[index] = points;
                this.#linesPointsInitial[index] = points;
                this.#linesDistances[index] = 0;//Math.abs(points[0].distanceTo(points[1]));
                //
                this.#params.scene.add(line);
            }

            this.#lines[index].geometry.setFromPoints(points);
            this.#lines[index].geometry.computeBoundingSphere();
            // we also update the distances
            const dist = Math.abs(points[0].distanceTo(points[1]));
            this.#linesDistances[index] = (dist);
            // based on distance we change the color
            //const distNormalize = Math.max(dist, 100.0) / 100.0;
            const distNormalize = dist / 5.0;
            //console.log(dist);
            const col1 = new THREE.Color(0xFF0000);
            const col2 = new THREE.Color(0x0000FF);

            // is dist not in absolutes or smn? it doesn't seem to register when rotating and then on the other side?
            
            if(dist <= (iteratorHitbox.sphereRadius * 1.1 + componentInstanceHurtbox.sphereRadius * 1.1))
            {
                col1.setColorName("cyan");
            }
            else {
                col1.lerp(col2, distNormalize);
            }
            this.#lines[index].material.color.set(col1.r, col1.g, col1.b);
            //
            index++;
        }
        index = 0;
    }

    methodUpdateHitboxIteration(listEntities, iteratorEntity, componentInstanceHitboxList, componentInstanceHurtbox)
    {
            var index = 0;
            // since we have multiple hitboxes, we need to loop through them
            for(const iteratorHitbox of componentInstanceHitboxList.arraySpheres)
            {
                /*
                // though we should be mindful of global position
                const sphereA = new THREE.Sphere();
                // do we use .sphereWorldPosition ?
                // or .spherePositionAfterRotation ?
                sphereA.center.copy(iteratorHitbox.sphereWorldPosition);
                sphereA.radius = iteratorHitbox.sphereRadius * 2;
                const sphereB = new THREE.Sphere();
                sphereB.center.copy(componentInstanceHurtbox.sphereWorldPosition);
                sphereB.radius = componentInstanceHurtbox.sphereRadius * 2;
                const isIntersecting = sphereA.intersectsSphere(sphereB);
                */

                // we have already pre-calculated distances, hehe
                const isIntersecting = (this.#linesDistances[index] < (iteratorHitbox.sphereRadius + componentInstanceHurtbox.sphereRadius));

                // early continue: no intersection
                if(!isIntersecting)
                {
                    index++;
                    continue;
                }
                // but if we do intersect, then broadcast
                iteratorEntity.methodBroadcastMessage({
                    invokableHandlerName: 'battleevent.takedamage',
                    invokableHandlerValue: 0.1,
                });
                // with future knowledge we know that we should re-check the lines here
                // but actually hurtbox.js should handle that
                // or more specifically battleevent.takedamage
                // BUT
                // hurtbox.js has no reference to this here hitbox manager
                // and it would be unreasonable to expect it to have that
                // so we do run it ourselves


                // dilstest test
                // disable update lines for now
                // we should instead call for all entities with a hitbox manager
                // and do that in a loop there
                //
                // I mean why not make that a message, then? and subscribe to it in the hitbox manager?
                // or wait, that wouldn't go out to all entities... would it?
                //this.methodUpdatePositionLines(null);
                this.methodUpdateDistancesForAllHitboxManagers(null);
                
                
                
                // the alternative would be to update every frame
                // which we might have to do anyway lmao
                // since we currently don't account for the enemy moving on their own
                // and we can ASSUME that SOMETHING will move every frame

                // OR
                // every update position
                // will check all entities with component hitbox manager
                // including itself


                if(this.#hasRanOnce != true)
                {
                    /*
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

                    */
                    this.#hasRanOnce = true;
                }
                index++;
                return true;
            }
            index = 0;
            return false;
    }

    //

    methodUpdateDistancesForAllHitboxManagers(paramMessage)
    {
        // first we get a list of all entities that have hitbox managers
        
        // we either exclude ourselves from getting ourselves
        // in which case we need to do our own update manually
        // or we let ourselves put ourselves in that list
        // which we do in this case

        //
        const listEntitiesWithHitboxManagerComponent = this.methodGetEntitiesWithComponent("EntityComponentHitboxManager");
        // early return
        if(listEntitiesWithHitboxManagerComponent == null || listEntitiesWithHitboxManagerComponent == undefined || listEntitiesWithHitboxManagerComponent.length <= 0){return;}

        // we alter our paramMessage
        // first we can check if it is null (it can be)
        if(paramMessage == null){paramMessage = {};}
        paramMessage.invokableHandlerName = "update.distances";
        // reminder: ... is the spread operator, spreads out the contents into it, does not create a second level/tier
        paramMessage.invokableHandlerValue = {...paramMessage.invokableHandlerValue, test: "test",};

        // loop through them all and give them a message
        for(var i = 0; i < listEntitiesWithHitboxManagerComponent.length; i++)
        {
            //
            listEntitiesWithHitboxManagerComponent[i].methodBroadcastMessage(paramMessage);
        }
    }

    // helpers

    methodIsIterable(obj)
    {
        // checks for null and undefined
        if (obj == null) {
            return false;
        }
        return typeof obj[Symbol.iterator] === 'function';
    }
}


//
export class EntityComponentHitboxListListGeneric extends EntityComponent
{
    // bare minimum
    #params = null;

    // 0 : hurtbox (aka defending)
    // 1 : hitbox (aka attacking)
    #type = 0;

    // all of the below are two-tier, second order arrays, aka multidimensional
    #twoDimArraySpheres = [];
    #twoDimArraySpheresCount = [];
    #twoDimArraySpheresRadius = [];
    #twoDimArraySpheresPositionOffset = [];

    // construct
    constructor(params)
    {
        //
        super(params);
        this.#params = params;

        //
        if(this.#params.type != null && this.#params.type != undefined)
        {
            this.#type = this.#params.type;
        }

        //
        if(this.#params.twoDimSphereCount != null && this.#params.twoDimSphereCount != undefined)
        {
            this.#twoDimArraySpheresCount = this.#params.twoDimSphereCount;
        }
        if(this.#params.twoDimPositionOffset != null && this.#params.twoDimPositionOffset != undefined)
        {
            this.#twoDimArraySpheresPositionOffset = this.#params.twoDimPositionOffset;
        }
        if(this.#params.twoDimArraySpheresRadius != null && this.#params.twoDimArraySpheresRadius != undefined)
        {
            this.#twoDimArraySpheresRadius = this.#params.twoDimArraySpheresRadius;
        }
    }

    // getters

    get twoDimArraySpheres(){return this.#twoDimArraySpheres;}

    // lifecycle

    methodInitialize()
    {
        //
        console.log(" ");
        console.log("init list list");

        //
        console.log(" ");
        console.log("["+ this.#twoDimArraySpheresCount.length +"] this.#twoDimArraySpheresCount.length");
        console.log("["+ this.#twoDimArraySpheresCount[0] +"] this.#twoDimArraySpheresCount[0]");

        //
        for(var i = 0; i < this.#twoDimArraySpheresCount.length; i++)
        {
            // don't we need the j loop? we don't seem to use it... except for the count I guess.
            for(var j = 0; j < this.#twoDimArraySpheresCount[i]; j++)
            {
                console.log(" ");
                console.log(this.#twoDimArraySpheresCount[i][j]);
                console.log(this.#twoDimArraySpheresPositionOffset[i][j]);
                console.log(this.#twoDimArraySpheresRadius[i][j]);

                const sphereList = new EntityComponentHitboxListGeneric({
                    ...this.#params,
                    type:this.#type,
                    countSpheres:this.#twoDimArraySpheresCount[i][j],
                    offsetPositions:this.#twoDimArraySpheresPositionOffset[i],
                    radii:this.#twoDimArraySpheresRadius[i],
                });
                sphereList.methodSetParent(this);
                sphereList.methodInitialize();
                this.#twoDimArraySpheres.push(sphereList);
            }
        }
        
        //
        //console.log(this.methodGetName() + " has these ("+ this.#arraySpheresCount +") spheres for hitboxes:");
        //console.log(this.#arraySpheres);
    }

    methodUpdate(){}
}
//
export class EntityComponentHitboxListList extends EntityComponentHitboxListListGeneric
{
    // override construct
    // to set type
    constructor(params)
    {
        // override params
        params.type = 1;
        // base aka bare minimum
        super(params);
    }
}
export class EntityComponentHurtboxListList extends EntityComponentHitboxListListGeneric
{
    // override construct
    // to set type
    constructor(params)
    {
        // override params
        params.type = 0;
        // base aka bare minimum
        super(params);
    }
}


//
export class EntityComponentHitboxListGeneric extends EntityComponent
{
    // bare minimum
    #params = null;

    // 0 : hurtbox (aka defending)
    // 1 : hitbox (aka attacking)
    #type = 0;

    //
    #arraySpheres = [];
    #arraySpheresCount = 0;
    #arraySpheresRadius = [];
    #arraySpheresPositionOffset = [];

    // construct
    constructor(params)
    {
        console.log(params);
        //
        super(params);
        this.#params = params;

        //
        if(this.#params.type != null && this.#params.type != undefined)
        {
            this.#type = this.#params.type;
        }
        if(this.#params.countSpheres != null && this.#params.countSpheres != undefined){
        this.#arraySpheresCount = this.#params.countSpheres;
        }
        if(this.#params.offsetPositions != null && this.#params.offsetPositions != undefined){
        this.#arraySpheresPositionOffset = this.#params.offsetPositions;
        }
        if(this.#params.radii != null && this.#params.radii != undefined){
        this.#arraySpheresRadius = this.#params.radii;
        }
    }

    // getters

    get arraySpheres(){return this.#arraySpheres;}

    // lifecycle

    methodInitialize()
    {
        //
        for(var i = 0; i < this.#arraySpheresCount; i++)
        {
            // reminder: ... places all of the contents in #params into the object, without creating a second tier
            const s = new EntityComponentHitboxGeneric({
                ...this.#params,
                type:this.#type,
                offsetPosition:this.#arraySpheresPositionOffset[i],
                radius:this.#arraySpheresRadius[i],
            });
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
export class EntityComponentHitboxList extends EntityComponentHitboxListGeneric
{
    // override construct
    // to set type
    constructor(params)
    {
        // override params
        params.type = 1;
        // base aka bare minimum
        super(params);
    }
}
export class EntityComponentHurtboxList extends EntityComponentHitboxListGeneric
{
    // override construct
    // to set type
    constructor(params)
    {
        // override params
        params.type = 0;
        // base aka bare minimum
        super(params);
    }
}


//
export class EntityComponentHitboxGeneric extends EntityComponent
{
    // bare minimum
    #params = null;

    // 0 : hurtbox (aka defending)
    // 1 : hitbox (aka attacking)
    #type = 0;

    //
    #sphere = null;
    #sphereRadius = 0.5;
    #sphereWorldPosition = null;
    #spherePositionOffset = {x:0,y:0,z:0};

    #spherePositionAfterRotation = null;

    // construct
    constructor(params)
    {
        console.log("["+params.type+"] params.type");

        // base aka bare minimum
        super(params);
        this.#params = params;

        //
        this.#sphereWorldPosition = new THREE.Vector3();
        this.#spherePositionAfterRotation = new THREE.Vector3(0,0,0);

        //
        if(this.#params.type != null && this.#params.type != undefined)
        {
            console.log(this.#params.type);
            this.#type = this.#params.type;
        }
        if(this.#params.offsetPosition != null && this.#params.offsetPosition != undefined)
        {
            this.#spherePositionOffset = this.#params.offsetPosition;
        }
        if(this.#params.radius != null && this.#params.radius != undefined)
        {
            this.#sphereRadius = this.#params.radius;
        }

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

    get spherePositionAfterRotation(){return this.#spherePositionAfterRotation;}

     // lifecycle

    methodInitialize()
    {
        console.log("["+this.methodGetName()+"] name ["+this.#type+"] type");
        //
        const geometry = new THREE.SphereGeometry(this.#sphereRadius,4,4);
        const color = ((this.#type == 0) ? 0xffff00 : 0xff0000);
        const material = new THREE.MeshBasicMaterial( { color: color, wireframe: true, side: THREE.DoubleSide, depthTest: false, } );
        this.#sphere = new THREE.Mesh( geometry, material );
        
        //
        if(this.#params.isFixedToCamera == true)
        {
            //
            console.log("is indeed fixed to camera");
            this.#params.cameraPivot.add(this.#sphere);
        }
        else {
            //
            console.log("not fixed to camera");
            this.#params.scene.add(this.#sphere);
        }
        //
        this.methodMoveSphereByOffset();

        //
        this.#spherePositionAfterRotation.copy(this.methodGetPosition());
        this.#spherePositionAfterRotation.add(this.#spherePositionOffset);

        // register handlers

        this.methodRegisterInvokableHandler('update.position', (paramMessage) =>{ this.methodHandleUpdatePosition(paramMessage);});
        this.methodRegisterInvokableHandler('update.rotations', (paramMessage) =>{ this.methodHandleUpdateRotations(paramMessage);});

        //
        if(this.#type == 0)
        {
            this.methodRegisterInvokableHandler('battleevent.takedamage', (paramMessage) =>{ this.methodHandleTakeDamage(paramMessage);});
        }
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
            this.methodMoveSphereByOffset();
        }
    }

    // handlers

    methodHandleUpdatePosition(paramMessage)
    {
        // to do
        // update the distances / lines of all components that have a hitbox manager

        //
        if(this.#params.isFixedToCamera == true){return;}

        this.#sphere.position.copy(paramMessage.invokableHandlerValue);
        //this.#sphere.position.copy(this.methodGetPosition());
        this.methodMoveSphereByOffset();

        // only if we have a camera do we do this
        // otherwise we should have an equivalent without the camera
        if(this.#params.cameraPivot != null)
        {
            this.methodSetRotationAroundCenter();
        }
        else
        {
            this.methodSetRotationAroundCenterWithoutCamera();
        }

        // and then we rotate based on our current rotation?
        // it works!!!
        //const theta = this.#params.cameraPivot.rotation.y;
        //this.methodRotateAroundCenter(theta);

        //
        //this.#sphere.rotation.y = this.#params.cameraPivot.rotation.y;


        // how to handle rotations?
        // we are not currently a child of the camera, mind you

        // one idea is to google threejs rotate around point

        // another is:
        // have a fake test point as a child from the camera
        // rotate around the player
        // and then just copy that position?
    }
    methodHandleUpdateRotations(paramMessage)
    {
        //
        if(this.#params.isFixedToCamera == true){return;}
        
        //
        const theta = paramMessage.invokableHandlerValue.rotationADelta;

        //
        //this.methodRotateAroundCenter(theta);
        
        // only if we have a camera do we do this
        // otherwise we should have an equivalent without the camera
        if(this.#params.cameraPivot != null)
        {
            this.methodSetRotationAroundCenter();
        }
        else
        {
            this.methodSetRotationAroundCenterWithoutCamera();
        }
    }


    methodHandleTakeDamage(paramMessage)
    {
        return;
        //console.log(this.methodGetName() + " is hit!");

        // signal to AI component instead
        //this.#modeMoveAround = true;

        //console.log("dmg!!!");
        //console.log(paramMessage.invokableHandlerValue);
        const pos = new THREE.Vector3();
        pos.copy(this.methodGetPosition());
        pos.y += 0.1;
        this.methodSetPosition(pos);
        // reminder that setposition will also call the update position handler
        // so we don't need to do that manually

        // this updates our position
        // but it doesn't update the hitboxmanager of the enemy
        // so we're going to have to do that in the hitbox manager
    }

    // other

    methodRotateAroundCenter(theta)
    {
        // https://stackoverflow.com/a/42866733
        // this rotates the hitbox by a delta
        // we WOULD also like to have the alternative to just SET the rotation
        // I guess that is a todo
        rotateObjectAboutPoint(
            this.#sphere,
            this.methodGetPosition(),
            new THREE.Vector3(0,1,0),
        theta,
        true
        );
    }
    methodSetRotationAroundCenter()
    {
        // early return
        if(this.#params.cameraPivot == null || this.#params.cameraPivot == undefined)
        {
            console.error("no cameraPivot | name: " + this.methodGetName());
            console.log("well... why are we trying to set the rotation of entity2 in the first place?");
            return;
        }

        //
        const posWorld = new THREE.Vector3();
        posWorld.copy(this.methodGetPosition());
        const spherePositionOffsetRotated = new THREE.Vector3();
        spherePositionOffsetRotated.copy(this.#spherePositionOffset);
        var theta = this.#params.cameraPivot.rotation.y;
        const epsilon = 0.0001;
        const isQuadrantHalf = ((this.#params.cameraPivot.rotation.x < -epsilon) || (this.#params.cameraPivot.rotation.z < -epsilon) || (this.#params.cameraPivot.rotation.x > epsilon) || (this.#params.cameraPivot.rotation.z > epsilon));
        const isQuadrant1 = isQuadrantHalf && this.#params.cameraPivot.rotation.y >= 0;
        const isQuadrant2 = isQuadrantHalf && this.#params.cameraPivot.rotation.y < 0;
        if(isQuadrant1)
        {
            theta = Math.PI - this.#params.cameraPivot.rotation.y;
        }
        else if (isQuadrant2)
        {
            theta = Math.PI - this.#params.cameraPivot.rotation.y;
        }
        //console.log(" ");
        //console.log("pivot rotation:");
        //console.log(this.#params.cameraPivot.rotation);
        //console.log("non-pivot rotation:");
        //console.log(this.#params.camera.rotation);
        spherePositionOffsetRotated.applyAxisAngle(new THREE.Vector3(0,1,0), theta);
        posWorld.add(spherePositionOffsetRotated);
        this.#sphere.position.x = posWorld.x;
        this.#sphere.position.y = posWorld.y;
        this.#sphere.position.z = posWorld.z;

        //
        this.#spherePositionAfterRotation.copy(posWorld);

        // update lines too?
    }
    methodSetRotationAroundCenterWithoutCamera()
    {
        // ahh it was our order of operation that was whack
        // perhaps it triggered another .update, perhaps the data just got all whack
        // if we separate them nicely like this we won't have an issue
        this.#spherePositionAfterRotation.copy(this.methodGetPosition());
        this.#spherePositionAfterRotation.add(this.#spherePositionOffset);
    }


    methodMoveSphereByOffset()
    {
        // early return: no offset
        if(this.#spherePositionOffset == null || this.#spherePositionOffset == undefined){return;}

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
export class EntityComponentHitbox extends EntityComponentHitboxGeneric
{
    // override construct
    // to set type
    constructor(params)
    {
        // override params
        params.type = 1;
        // base aka bare minimum
        super(params);
    }
}
export class EntityComponentHurtbox extends EntityComponentHitboxGeneric
{
    // override construct
    // to set type
    constructor(params)
    {
        // override params
        params.type = 0;
        // base aka bare minimum
        super(params);
    }
}


//
/*
export class EntityComponentHurtbox extends EntityComponent
{
    // bare minimum
    #params = null;

    //
    #sphere = null;
    #sphereRadius = 0.5;
    #sphereWorldPosition = null;
    #spherePositionOffset = {x:0,y:1,z:0};
    #spherePositionAfterRotation = null;

    // testing
    #modeMoveAround = false;

    // construct
    constructor(params)
    {
        super(params);
        this.#params = params;

        //
        this.#sphereWorldPosition = new THREE.Vector3();
        if(this.#params.offsetPosition != null && this.#params.offsetPosition != undefined)
        {
            this.#spherePositionOffset = this.#params.offsetPosition;
        }
        if(this.#params.radius != null && this.#params.radius != undefined)
        {
            this.#sphereRadius = this.#params.radius;
        }

        //
        this.#spherePositionAfterRotation = new THREE.Vector3(0,0,0);

        //
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
        const geometry = new THREE.SphereGeometry(this.#sphereRadius,4,4);
        const material = new THREE.MeshBasicMaterial( { color: 0xffff00, wireframe: true, visible: true, } );
        this.#sphere = new THREE.Mesh( geometry, material );
        //
        this.#params.scene.add(this.#sphere);
        //
        this.methodMoveSphereByOffset();

        // register handlers

        this.methodRegisterInvokableHandler('update.position', (paramMessage) =>{ this.methodHandleUpdatePosition(paramMessage);});
        this.methodRegisterInvokableHandler('battleevent.takedamage', (paramMessage) =>{ this.methodHandleTakeDamage(paramMessage);});
    }

    methodUpdate(timeElapsed, timeDelta)
    {
        // early return
        if(this.#modeMoveAround != true){return;}

        //
        const pos = new THREE.Vector3();
        pos.copy(this.methodGetPosition());
        pos.x += Math.sin(timeElapsed * 5) * 0.1;
        this.methodSetPosition(pos);
    }

    // handlers

    methodHandleUpdatePosition(paramMessage)
    {
        // base aka bare minimum
        this.#sphere.position.copy(paramMessage.invokableHandlerValue);
        //
        this.methodMoveSphereByOffset();

        //
        this.methodUpdateDistances();
    }

    methodHandleTakeDamage(paramMessage)
    {
        this.#modeMoveAround = true;

        //console.log("dmg!!!");
        //console.log(paramMessage.invokableHandlerValue);
        const pos = new THREE.Vector3();
        pos.copy(this.methodGetPosition());
        pos.y += 0.1;
        this.methodSetPosition(pos);
        // reminder that setposition will also call the update position handler
        // so we don't need to do that manually

        // this updates our position
        // but it doesn't update the hitboxmanager of the enemy
        // so we're going to have to do that in the hitbox manager
    }

    // other

    methodMoveSphereByOffset()
    {
        // early return: no offset
        if(this.#spherePositionOffset == null || this.#spherePositionOffset == undefined){return;}

        //
        this.#sphere.position.x += this.#spherePositionOffset.x;
        this.#sphere.position.y += this.#spherePositionOffset.y;
        this.#sphere.position.z += this.#spherePositionOffset.z;
    }

    methodUpdateDistances()
    {
        // to do

        // get all entities that have the HitboxHandler component
        // and then call the update distances / update lines method on that

        // in the update distances / update lines method...
        // ...do we perhaps flag that we have updated that frame?
        // otherwise we do it multiple times per frame...
        // ...could be unnecessary

        const listEntitiesWithHitboxManagerComponent = this.methodGetEntitiesWithComponent("EntityComponentHitboxManager");
        // early return
        if(listEntitiesWithHitboxManagerComponent == null || listEntitiesWithHitboxManagerComponent == undefined || listEntitiesWithHitboxManagerComponent.length <= 0){return;}
        // foreach-loop through them all and compare sphere distances

        //
        for(var i = 0; i < listEntitiesWithHitboxManagerComponent.length; i++)
        {
            // we get the actual component inside the entity, not just the entity
            const componentHitboxManager = listEntitiesWithHitboxManagerComponent[i].methodGetComponent("EntityComponentHitboxManager");
            // early continue: no lines, so we don't need to update
            //if(componentHitboxManager.hasLines != true){continue;}
            // call the update
            componentHitboxManager.methodUpdatePositionLines(null);
        }

    }
}
*/