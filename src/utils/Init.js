
function init() {
    raycaster = new THREE.Raycaster(new THREE.Vector3(), new THREE.Vector3(0, - 1, 0), 0, 10);

    let createCrosshair = function (_x, _y, _z) {
        let mat = new THREE.MeshBasicMaterial({
            wireframe: true,
            transparent: false,
            depthTest: false,
            side: THREE.DoubleSide
        });
        let geo = new THREE.BoxGeometry(.01, .01, .01)
        let mesh = new THREE.Mesh(geo, mat)
        mesh.position.x = _x
        mesh.position.y = _y
        mesh.position.z = _z
        return mesh
    }

    crosshair = createCrosshair(camera.position.x, camera.position.y, camera.position.z)

    let gridHelper = new THREE.GridHelper(250);
    gridHelper.position.x = 0
    gridHelper.position.y = 0
    gridHelper.position.z = 0


    let Sphere = (x, y, z, r, h, d) => {
        let mat = new THREE.MeshPhongMaterial({
            wireframe: false,
            transparent: false,
            depthTest: true,
            side: THREE.DoubleSide
        });
        let geo = new THREE.SphereGeometry(r, h, d)
        let mesh = new THREE.Mesh(geo, mat)
        mesh.position.x = x
        mesh.position.y = y
        mesh.position.z = z

        return mesh
    }

    let createGrid = () => {

        // let p_0 = new Node(20, -10, 10, 10, .01,0,0)
        // let mesh_0 = p_0.createSphere()

        // let p_1 = new Node(30, 10, -10, 10, 0,-.01,0)
        // let mesh_1 = p_1.createSphere()

        // let p_2 = new Node(21, 10, 10, -10, 0, 0,.01)
        // let mesh_2 = p_2.createSphere()

        // scene.add(mesh_0)
        // scene.add(mesh_1)
        // scene.add(mesh_2)
        // objects.push(mesh_0)
        // objects.push(mesh_1)
        // objects.push(mesh_2)
        
        // physicsObjects.push(p_0, p_1, p_2)
        // physicsObjectsCreated = true

        //START       
        // console.log("Creating blank Box Grid")
        let sq_width = 4
        let spacing = 25

        //Generate Grid of Boxes
        let x = 0
        let z = 0
        for (let i = 0; i < sq_width; i++) {
            x = x + spacing
            for (let j = 0; j < sq_width; j++) {
                z = z + spacing
                // let p = Sphere(x, 2, z, 1, 10, 10)
                // scene.add(p)
                // objects.push(p)

                //INITIALIZE PHYSICS NODE
                let p = new Node(Math.random()*20, x, Math.random()*10, z, 0, 0)
                let mesh = p.createSphere()

                scene.add(mesh)
                objects.push(mesh)
                physicsObjects.push(p)
                physicsObjectsCreated = true
            }
            z = z - sq_width * spacing
        }
        //END
    }
    setRaycaster = (event) => {

        raycaster.setFromCamera(pointer, camera);
        raycaster.near = 10;
        raycaster.far = 100;
        const intersections = raycaster.intersectObjects(objects, false);
        const onObject = intersections.length > 0;
        if (onObject) {
            intersections.forEach(element => {
                console.log("RAYCAST HIT: ", element)
                element.object.material.color = new THREE.Color(0xfd6012)
            })

        }

    }
    getPointer = (event) => {
        pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
        pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;
    }

    setZoom = (level) => {
        let zoom = camera.zoom; // take current zoom value
        zoom = Math.min(Math.max(.125, level), 4); /// clamp the value

        camera.zoom = zoom /// assign new zoom value
        camera.updateProjectionMatrix(); /// make the changes take effect

    }

    constrain = (num, min, max) => {
        return Math.min(Math.max(num, min), max);
    };


    let createStars = function () {
        let M = 28
        let N = 28
        let scaler = 10;
        let vertices = [];
        let spacing_scale = 50
        for (let x = -M; x <= M; x += 1) {
            for (let z = -N; z <= N; z += 1) {
                // vertices.push(x / scaler, 0 / scaler, z / scaler)
                vertices.push(
                    THREE.MathUtils.randFloatSpread(2000),
                    THREE.MathUtils.randFloatSpread(2000),
                    THREE.MathUtils.randFloatSpread(2000))
            }
        }

        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
        let material = new THREE.PointsMaterial({ size: .07, sizeAttenuation: true, alphaTest: 0.5, transparent: true });
        material.color.setHSL(.6, 0.8, 0.9);
        const particles = new THREE.Points(geometry, material);
        scene.add(particles);
    }

    // const loader = new GLTFLoader();

    // loader.load('/static/untitled.glb', function (gltf) {

    //     scene.add(gltf.scene);

    // }, undefined, function (error) {

    //     console.error(error);

    // });

    createStars()
    scene.add(crosshair)
    scene.add(gridHelper);
    createGrid()

    console.log("INIT, Physics Objects", physicsObjects)

}




