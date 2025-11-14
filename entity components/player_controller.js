import * as THREE from "three";
import {EntityComponent} from "entity_component";

export class EntityComponentPlayerControllerInput extends EntityComponent
{
    #params = null;
    #keys = null;
    constructor(params)
    {
        super(params);
        this.#params = params;
    }
    get keys() {return this.#keys;}
    methodInitialize()
    {
        this.#keys =
        {
            forward: false,
            backward: false,
            left: false,
            right: false,
            up: false,
            down: false,
        };
        document.addEventListener('keydown', (e) => this.methodEventOnKeyDown(e), false);
        document.addEventListener('keyup', (e) => this.methodEventOnKeyUp(e), false);
    }
    methodEventOnKeyDown(e)
    {
        switch (e.keyCode)
        {
            case 81: // letter q
                this.#keys.up = true;
                break;
            case 87: // letter w
                this.#keys.forward = true;
                break;
            case 65: // letter a
                this.#keys.left = true;
                break;
            case 69: // letter e
                this.#keys.down = true;
                break;
            case 83: // letter s
                this.#keys.backward = true;
                break;
            case 68: // letter d
                this.#keys.right = true;
                break;
        }
    }
    methodEventOnKeyUp(e)
    {
        switch (e.keyCode)
        {
            case 81: // letter q
                this.#keys.up = false;
                break;
            case 87: // letter w
                this.#keys.forward = false;
                break;
            case 69: // letter e
                this.#keys.down = false;
                break;
            case 65: // letter a
                this.#keys.left = false;
                break;
            case 83: // letter s
                this.#keys.backward = false;
                break;
            case 68: // letter d
                this.#keys.right = false;
                break;
        }
    }
}

export class EntityComponentPlayerController extends EntityComponent
{
    #params = null;
    #keys = null;
    constructor(params)
    {
        super(params);
        this.#params = params;
    }

    methodUpdate()
    {
        const componentInstanceInput = this.methodGetComponent("EntityComponentPlayerControllerInput");
        // early return: no entity component instance
        if(componentInstanceInput == null){return;}

        //
        const componentInstanceCameraControllerFirstPerson = this.methodGetComponent("EntityComponentCameraControllerFirstPerson");
        // early return: no entity component instance
        if(componentInstanceCameraControllerFirstPerson == null){return;}

        
        // we can use this index to determine if we should move in the first place
        // and also
        // the polarity
        var indexMovingOnForwardBackwardAxis = 0;
        if(componentInstanceInput.keys.forward == true) {indexMovingOnForwardBackwardAxis = 1;}
        else if(componentInstanceInput.keys.backward == true) {indexMovingOnForwardBackwardAxis = -1;}
        if(indexMovingOnForwardBackwardAxis != 0)
        {
            this.#params.cameraPivot.position.addScaledVector(componentInstanceCameraControllerFirstPerson.directionForwardNonvertical, 0.05 * indexMovingOnForwardBackwardAxis);
        }

        // we can use this index to determine if we should move in the first place
        // and also
        // the polarity
        var indexMovingOnLeftRightAxis = 0;
        if(componentInstanceInput.keys.left == true) {indexMovingOnLeftRightAxis = 1;}
        else if(componentInstanceInput.keys.right == true) {indexMovingOnLeftRightAxis = -1;}
        if(indexMovingOnLeftRightAxis != 0)
        {
            this.#params.cameraPivot.position.addScaledVector(componentInstanceCameraControllerFirstPerson.directionRightNonvertical, 0.05 * indexMovingOnLeftRightAxis);
        }

        //
        if(componentInstanceInput.keys.up == true)
        {
            this.#params.cameraPivot.position.y += 0.05;
        }
        else if(componentInstanceInput.keys.down == true)
        {
            this.#params.cameraPivot.position.y -= 0.05;
        }
    }
}