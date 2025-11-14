// ECS architecture
// https://keep.google.com/u/0/#NOTE/1VZcHow6i1CL34hbKCEnhdlomP1MtBxrzssvUT4wwMWJLCXrubqAjogXsTz7MCC4

// should not be used on its own
// this class should always be extended from
// unlike entity, which instances are created from the base class every time

export class EntityComponent
{
    #params = null;
    #parent = null;
    constructor()
    {
        //
        //super(params);
        this.#parent = null;
    }

    // getters
    methodGetComponent(paramComponentName)
    {
        return this.#parent.methodGetComponent(paramComponentName);
    }

    // setters
    methodSetParent(paramParent){this.#parent = paramParent;}

    // registers

    methodRegisterInvokableHandler(paramInvokableHandlerName, paramInvokableHandler)
    {
        this.#parent.methodRegisterInvokableHandler(paramInvokableHandlerName, paramInvokableHandler);
    }

    // lifecycle

    methodInitialize()
    {
        console.log("entity component initialized: base class");
    }

    methodUpdate(timeElapsed, timeDelta) { }

    // ...

    methodBroadcastMessage(paramMessage)
    {
        this.#parent.methodBroadcastMessage(paramMessage);
    }
}