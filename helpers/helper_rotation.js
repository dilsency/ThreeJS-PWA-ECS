// obj - your object (THREE.Object3D or derived)
// point - the point of rotation (THREE.Vector3)
// axis - the axis of rotation (normalized THREE.Vector3)
// theta - radian value of rotation
// pointIsWorld - boolean indicating the point is in world coordinates (default = false)
export function rotateObjectAboutPoint(obj, point, axis, theta, pointIsWorld = false)
{
    if(pointIsWorld)
    {
        obj.parent.localToWorld(obj.position); // compensate for world coordinate
    }
  
    obj.position.sub(point); // remove the offset
    obj.position.applyAxisAngle(axis, theta); // rotate the POSITION
    obj.position.add(point); // re-add the offset
  
    if(pointIsWorld){
        obj.parent.worldToLocal(obj.position); // undo world coordinates compensation
    }
  
    obj.rotateOnAxis(axis, theta); // rotate the OBJECT
}

//
export function setRotationOfObjectAboutPoint(obj, point, axis, positionOffset, theta, pointIsWorld = false)
{
    // we change this by resetting the position first... maybe?
    console.log(positionOffset);
    obj.position.sub(positionOffset);

    if(pointIsWorld)
    {
        obj.parent.localToWorld(obj.position); // compensate for world coordinate
    }
  
    obj.position.sub(point); // remove the offset
    obj.position.applyAxisAngle(axis, theta); // rotate the POSITION
    obj.position.add(point); // re-add the offset
  
    if(pointIsWorld){
        obj.parent.worldToLocal(obj.position); // undo world coordinates compensation
    }
  
    obj.rotateOnAxis(axis, theta); // rotate the OBJECT
}