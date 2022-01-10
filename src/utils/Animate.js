function animate() {
    //Frame Start up
    requestAnimationFrame(animate);
    const time = performance.now();

    //Pointer Lock Controls, Where is the crosshair pointing?
    lookDir.x = cameraLookDir(camera).x
    lookDir.y = cameraLookDir(camera).y
    lookDir.z = cameraLookDir(camera).z




    //If Pointerlock controls active
    if (controls.isLocked === true) {

        const delta = (time - prevTime) / 1000;

        //Move WASD, SHIFT, SPACE
        velocity.x -= velocity.x * flyParams.flyRelease * delta;
        velocity.z -= velocity.z * flyParams.flyRelease * delta;
        velocity.y -= GRAVITY * velocity.y * flyParams.flyRelease * delta;

        direction.z = Number(moveForward) - Number(moveBackward);
        direction.x = Number(moveRight) - Number(moveLeft);
        direction.y = Number(moveUp) - Number(moveDown);
        direction.normalize(); // this ensures consistent movements in all directions

        if (moveForward || moveBackward) velocity.z -= direction.z * flyParams.flySpeed * delta;
        if (moveLeft || moveRight) velocity.x -= direction.x * flyParams.flySpeed * delta;
        if (moveUp || moveDown) velocity.y -= direction.y * flyParams.flySpeed * delta;

        controls.moveRight(- velocity.x * delta);
        controls.moveForward(- velocity.z * delta);
        controls.moveUp(velocity.y * delta);


        //CROSSHAIR
        crosshair.position.x = camera.position.x + 2 * lookDir.x
        crosshair.position.y = camera.position.y + 2 * lookDir.y
        crosshair.position.z = camera.position.z + 2 * lookDir.z
    }

    //PHYSICS UPDATE
    if (physicsObjectsCreated) {
        //LIMIT FRAMERATE
        if (frameIndex % 1 == 0) {
            //SETUP TEMPORARY FORCE BIN
            let objectForces = []
            //ITERATE THROUGH VERTICES
            for (let i = 0; i < physicsObjects.length; i++) {
                let i_force = new THREE.Vector3()
                for (let j = 0; j < physicsObjects.length; j++) {
                    if (i !== j) {
                        //FIND ATTRACTION FORCE
                        let v = physicsObjects[i].getUnitVectorTo(physicsObjects[j])
                        let d = physicsObjects[i].getDistanceTo(physicsObjects[j])
                        let m0 = physicsObjects[i].mass
                        let m1 = physicsObjects[j].mass
                        d = constrain(d, 1, 200)
                        let strength = .001 * ((m0 * m1) / d ** 2)
                        let attr_force = v.multiplyScalar(strength)
                        //ADD TO BUILDING NODE FORCE
                        i_force.add(attr_force)

                    }
                }
                objectForces.push(i_force)
            }

            // console.log(objectForces)
            for (let i = 0; i < physicsObjects.length; i++) {
                // console.log(physicsObjects.length, objectForces.length)
                let o = physicsObjects[i]
                let f = objectForces[i]
                o.applyForce(f)
                o.update()
                o.updateGeometry()
            }
        }
    }



    //PHYSICS UPDATE
    if (bulletObjectsCreated) {
        bulletObjects.forEach(element => {
            // console.log(lookDir)
            element.applyForce(element.lookDir)
            element.update()
            element.updateGeometry()
        });

    }
    if (cameraState.isCameraFollowing) {
        follow(camera, physicsObjects, raycastState.offset)
    }



    //Frame Shut Down
    prevTime = time;
    // renderer.render(scene, camera);
    
    composer.render();
    stats.update();
    frameIndex++;
}