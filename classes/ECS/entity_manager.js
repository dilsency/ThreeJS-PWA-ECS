// ECS architecture
// https://keep.google.com/u/0/#NOTE/1VZcHow6i1CL34hbKCEnhdlomP1MtBxrzssvUT4wwMWJLCXrubqAjogXsTz7MCC4

// a single instance of this class is created
// and that instance has a list of instances of the entity base class
// and those instances of the entity base class...
// ...have instances of classes that extend from the entity_component class

export class EntityManager
{
    #params = null;
    #entities = null;
    constructor(params)
    {
        //
        //super(params);
        this.#params = params;

        // we either use an array
        // or an object
        // we know how to loop through objects now...
        // ...so perhaps that is preferable?
        // SimonDev stores both...
        // ...but that seems unnecessary
        this.#entities = [];
    }

    // adders

    methodAddEntity(paramEntity, paramEntityName)
    {
        //
        if(!paramEntityName)
        {
            // we could generate a new unique name
            // or just something else
            paramEntityName = paramEntity.constructor.name;
        }

        // again, either array or object
        this.#entities.push(paramEntity);

        //
        paramEntity.methodSetParent(this);
        paramEntity.methodSetName(paramEntityName);
    }

    // getters

    methodGetEntityByIndex(index)
    {
        return this.#entities[index];
    }

    // lifecycle

    methodUpdate(timeElapsed, timeDelta)
    {
        // array version

        // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/for...of
        // javascript's version of a for each loop
        for(const iteratorEntity of this.#entities)
        {
            iteratorEntity.methodUpdate(timeElapsed, timeDelta);
        }


        // object version

        // if we use Object.entries(ourInstanceOfClass) we get only iterable properties
        // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/entries
        // if we only need keys
        // Object.keys(ourInstanceOfClass) instead
        // if we only need property values
        // Object.values(ourInstanceOfClass) instead

        // for..in could be used, but then we get prototype properties as well, which is unneccessary
        // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/for...in

        //for (const [key, value] of Object.entries(this.#entities))
        //{
        //    console.log(`${key}: ${value}`);
        //}
    }
}