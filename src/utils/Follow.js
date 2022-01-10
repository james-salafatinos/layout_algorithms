

follow = (camera, physicsObjects, offset, lookAt = false) => {
    console.log(offset)


    if (offset < 0){

        return null 
    }
    // console.log("FOLLOW", physicsObjects,offset)

    
    cameraState.isCameraFollowing = true
    let dx = physicsObjects[offset].velocity.x
    let dy = physicsObjects[offset].velocity.y
    let dz = physicsObjects[offset].velocity.z
    // console.log(dx,dy,dz)
    camera.position.x = physicsObjects[offset].mesh.position.x -  0 + dx*physicsObjects[offset].mass / 55 
    camera.position.y = physicsObjects[offset].mesh.position.y + 2 + dy*physicsObjects[offset].mass / 55
    camera.position.z = physicsObjects[offset].mesh.position.z - 0 + dz*physicsObjects[offset].mass / 55 

    if (lookAt) {
        camera.lookAt(physicsObjects[offset].mesh.position)
    }

}


