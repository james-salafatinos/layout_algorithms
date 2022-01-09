

//Movement
window.addEventListener('keydown', (event) => {

    switch (event.code) {

        case 'ArrowUp':
        case 'KeyW':
            moveForward = true;
            break;

        case 'ArrowLeft':
        case 'KeyA':
            moveLeft = true;
            break;

        case 'ArrowDown':
        case 'KeyS':
            moveBackward = true;
            break;

        case 'ArrowRight':
        case 'KeyD':
            moveRight = true;
            break;

        case 'Space':
            // if (canJump === true) velocity.y f+= 10;
            // canJump = true;
            moveUp = true
            break;
        case 'ShiftLeft':
            // if (canJump === true) velocity.y -= 10;
            // canJump = true;
            moveDown = true
            break;


    }

});

window.addEventListener('keyup', (event) => {

    switch (event.code) {

        case 'ArrowUp':
        case 'KeyW':
            moveForward = false;
            break;

        case 'ArrowLeft':
        case 'KeyA':
            moveLeft = false;
            break;

        case 'ArrowDown':
        case 'KeyS':
            moveBackward = false;
            break;

        case 'ArrowRight':
        case 'KeyD':
            moveRight = false;
            break;
        case 'Space':
            // if (canJump === true) velocity.y += 50;
            // velocity.y -= 10;
            // canJump = false;
            moveUp = false
            break;
        case 'ShiftLeft':
            // velocity.y -= 10;
            // canJump = false;
            moveDown = false
            break;

        case 'KeyE':
            var mouse = { x: 1, y: 1 };
            mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
            mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

            cameraLookDir = function (camera) {
                var vector = new THREE.Vector3(0, 0, -1);
                vector.applyEuler(camera.rotation, camera.rotation.order);
                return vector;
            }
            console.log('Camera Vec', cameraLookDir(camera))


            arrow = new THREE.ArrowHelper(cameraLookDir(camera), camera.position, 10, Math.random() * 0xffffff);
            scene.add(arrow);


            //Raycast
            raycaster = new THREE.Raycaster();
            raycaster.setFromCamera(pointer, camera);
            const intersects = raycaster.intersectObjects(scene.children, false);

            if (intersects.length > 0) {
                intersects.forEach(element => {
                    console.log(element)
                }
                )
            };
            break;

        case 'KeyF':
            break;
        case 'KeyG':
            console.log("Pressed G Key")
            break;
        case 'KeyB':
            console.log("Pressed B Key")
            console.log("All of the nodes linked to it: ")
            // Using the callback methods

            break;


    }

});

window.addEventListener('wheel', (event) => {
    event.preventDefault(); /// prevent scrolling

    let zoom = camera.zoom; // take current zoom value
    zoom += event.deltaY * -0.01; /// adjust it
    console.log('z', zoom)
    zoom = Math.min(Math.max(.125, zoom), 4); /// clamp the value

    camera.zoom = zoom /// assign new zoom value
    camera.updateProjectionMatrix(); /// make the changes take effect
}, { passive: false });


window.addEventListener('click', function (event) {

    //LEFT CLICK
    if (event.button == 0) {


        // Controls
        controls.lock();
        // Controls
        let scale_from_camera = 10
        let camera_pos = { x: camera.position.x, y: camera.position.y, z: camera.position.z }
        let camera_look = cameraLookDir(camera)

        //Create Arrow
        arrow = new THREE.ArrowHelper(cameraLookDir(camera), camera.position, 1.5, Math.random() * 0xffffff);
        console.log(camera_look)
        scene.add(arrow);

        //Create Node
        let node = new Node()
        node.lookDir = lookDir.clone()
        let mesh = node.createSphere(
            camera_pos.x + scale_from_camera * camera_look.x,
            camera_pos.y + scale_from_camera * camera_look.y,
            camera_pos.z + scale_from_camera * camera_look.z, .5, 5, 5)
        bulletObjectsCreated = true
        scene.add(mesh)
        bulletObjects.push(node)
    }


})


window.addEventListener('mousedown', function (event) {

    //LEFT CLICK
    if (event.button == 0) {
        setRaycaster(event);
        dragging = true;
    }

    //RIGHT CLICK
    if (event.button == 2) {
        console.log("Zoom hold start")
        zoom_holding = true
        setZoom(2)
    }
});

window.addEventListener('mousemove', function (event) {
    //DRAGGING & LEFT CLICK
    if (dragging) {
        setRaycaster(event);
        console.log('Dragging')

        //SHOOT
        if (frameIndex % 10 == 0) {
            let scale_from_camera = 10
            let camera_pos = { x: camera.position.x, y: camera.position.y, z: camera.position.z }
            let camera_look = cameraLookDir(camera)
            //Create Node
            let node = new Node(
                5, camera_pos.x + scale_from_camera * camera_look.x, 
                camera_pos.y + scale_from_camera * camera_look.y, 
                camera_pos.z + scale_from_camera * camera_look.z,
                )
            node.lookDir = lookDir.clone()
            let mesh = node.createSphere()
            bulletObjectsCreated = true
            bulletObjects.push(node)
            scene.add(mesh)

            // physicsObjects.push(node)
            // console.log(node)

        }

    }
    if (zoom_holding) {
        console.log('Zoom Holding')
        event.preventDefault(); /// prevent scrolling
        setZoom(2)
    }

});


window.addEventListener('mouseup', function (event) {

    console.log("Dragging end, Zoom End")
    if (dragging && event.button == 0) {
        dragging = false;
    }

    if (zoom_holding && event.button == 2) {
        zoom_holding = false;
        setZoom(1.125)
    }


});


window.addEventListener('resize', function (event) {

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);

});


// window.addEventListener("mousemove", mouseMove);