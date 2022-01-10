
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
        let _offset = 0
        // let p_0 = new Node(1000, -50, 10, 10, _offset, 0,0,0, .01)
        // let mesh_0 = p_0.createSphere()
        // scene.add(mesh_0)
        // physicsObjectsMesh.push(mesh_0)
        // physicsObjects.push(p_0)
        // _offset +=1
        // physicsObjectsCreated = true




        //START       
        // console.log("Creating blank Box Grid")
        let sq_width = 12
        let spacing = 9

        //Generate Grid of Physics Objects
        let x = 0
        let z = 0
        
        for (let i = 0; i < sq_width; i++) {
            x = x + spacing
 
            for (let j = 0; j < sq_width; j++) {
                z = z + spacing
        
                //INITIALIZE & CREATE PHYSICS NODE
                let p = new Node(Math.random(), x, Math.random()*10, z, _offset)
                let mesh = p.createSphere()
                
        

                //Add to Scene
                scene.add(mesh)

                //Add to global lists
                
                physicsObjectsMesh.push(mesh)
                physicsObjects.push(p)
                _offset +=1
                physicsObjectsCreated = true

                //Adjust number of created objects
               
            }
            z = z - sq_width * spacing
            
        }
        //END
    }

    setRaycaster = (event) => {

        raycaster.setFromCamera(pointer, camera);
        raycaster.near = 10;
        raycaster.far = 100;
        const intersections = raycaster.intersectObjects(physicsObjectsMesh, false);
        // console.log('physics objects', physicsObjects, 'objects',objects)
        const onObject = intersections.length > 0;
        if (onObject) {
            intersections.forEach(element => {
                console.log("@setRaycaster, element.object.userData.offset", element.object.userData.offset)
                raycastState.offset = element.object.userData.offset
                element.object.userData.hasBeenRaycast = true
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
        let material = new THREE.PointsMaterial({ size: .7, sizeAttenuation: true, alphaTest: 0.2, transparent: true });
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




