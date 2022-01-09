import * as THREE from '/modules/three.module.js';
import { PointerLockControls } from "/modules/PointerLockControls.js";
import { GUI } from "/modules/dat.gui.module.js";
import { GLTFLoader } from '/modules/GLTFLoader.js';



//THREE JS
let camera, scene, renderer
//CONTROLS & INTERACTIONS
let controls;
let moveForward = false;
let moveBackward = false;
let moveLeft = false;
let moveRight = false;
let moveUp = false;
let moveDown = false;
let dragging = false;
let zoom_holding = false;
let raycaster;
let lookDir = new THREE.Vector3()
let pointer = new THREE.Vector2();
//PERFORMANCE
let prevTime = performance.now();
//PHYSICS
let velocity = new THREE.Vector3();
let direction = new THREE.Vector3();
let GRAVITY = 1
//OBJECTS
let crosshair;
let arrow
//OBJECT GROUPS
let meshes = []
let objects = [];
let physicsObjectsCreated = false
let physicsObjects = []
let bulletObjectsCreated = false
let bulletObjects = []
//HELPERS
let gridHelper
let frameIndex = 0
// PARAMS
let flyParams = {
    flySpeed: 500,
    flyRelease: 30
}
// FUNCTIONS
let mouseDown
let mouseMove
let mouseUp
let getPointer
let setRaycaster
let cameraLookDir
let setZoom
let constrain

class Node {
    constructor(m, x, y, z, ivx = 0, ivy = 0, ivz = 0) {
        this.mass = m
        this.pos = new THREE.Vector3(x, y, z)
        this.velocity = new THREE.Vector3(0,0,0)
        this.acceleration = new THREE.Vector3(ivx,ivy,ivz)
        this.dirVector = new THREE.Vector3()
        this.mesh
        this.lookDir
    }
    createSphere() {
        let mat = new THREE.MeshPhongMaterial({
            wireframe: false,
            transparent: false,
            depthTest: true,
            side: THREE.DoubleSide
        });
        let geo = new THREE.SphereGeometry(this.mass/20, 5, 5)
        let mesh = new THREE.Mesh(geo, mat)
        mesh.position.x = this.x
        mesh.position.y = this.y
        mesh.position.z = this.z
        this.mesh = mesh
        return mesh
    }
    updateGeometry = function () {
        // console.log(this.pos)
        this.mesh.position.x = this.pos.x
        this.mesh.position.y = this.pos.y
        this.mesh.position.z = this.pos.z

    }

    // Mover applyForce
    applyForce = function (force) {
        let a = force.clone()
        // console.log('a', a)
        // a.divideScalar(this.mass)// (F = ma)
        this.acceleration.add(a);
        // console.log('acc',this.acceleration)

    }

    _constrain = function (num, min, max) {
        return Math.min(Math.max(num, min), max);
    };

    getUnitVectorTo = function (otherObject) {
        var dir = new THREE.Vector3(); // create once an reuse it
        dir.subVectors(this.pos, otherObject.pos).normalize();
        dir.multiplyScalar(-1)
        return dir
    }

    getDistanceTo = function (otherObject){
        var distance = this.pos.distanceTo( otherObject.pos);
        return distance
    }

    attract = function (otherObject) {

        let vec = this.pos.clone().sub(otherObject.pos.clone()).normalize()
        let distance = this.pos.clone().distanceTo(otherObject.pos.clone())
        distance = this._constrain(distance, 2, 5)
        // console.log(vec,distance)
        // distance.clamp(2.0, 5.0);
        // console.log(GRAVITY, this.mass , otherObject.mass , distance )
        let strength = (.02 * this.mass * otherObject.mass) / (distance * distance);
        // // Trekkkraften: Jo større masse jo større kraft. Jo lenger avstand jo mindre kraft
        // console.log(strength)
        let force = vec.clone().multiplyScalar(strength);
        // force.multiplyScalar(.01)
        return force//.multiplyScalar(.00001);

    }


    update = function () {
        this.velocity.add(this.acceleration.clone());
        this.pos.add(this.velocity.clone());
        this.acceleration.multiplyScalar(0);
    }
}



setup();
init();
animate();

function setup() {
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 1000);
    camera.position.y = 10;

    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0000f);
    scene.fog = new THREE.Fog(0xffffff, 100, 750);

    const light = new THREE.HemisphereLight(0xeeeeff, 0x777788, 0.75);
    light.position.set(0.5, 1, 0.75);
    scene.add(light);

    controls = new PointerLockControls(camera, document.body);

    const blocker = document.getElementById('blocker');
    const instructions = document.getElementById('instructions');

    controls.addEventListener('lock', function () {
        instructions.style.display = 'none';
        blocker.style.display = 'none';

    });

    controls.addEventListener('unlock', function () {
        blocker.style.display = 'block';
        instructions.style.display = '';

    });

    scene.add(controls.getObject());

    //Look Dir
    cameraLookDir = function (camera) {
        var vector = new THREE.Vector3(0, 0, -1);
        vector.applyEuler(camera.rotation, camera.rotation.order);
        return vector;
    }

    
    /**
     * GUI
     */
     let gui = new GUI()
     const cameraFolder = gui.addFolder('Camera')
     cameraFolder.add(camera.position, 'x', 0, 15)
     cameraFolder.add(camera.position, 'y', 0, 15)
     cameraFolder.add(camera.position, 'z', 0, 15)
     // cameraFolder.open()
 
     renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);




}


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
        let sq_width = 12
        let spacing = 3

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

                        //CONSTRAIN D

                        d = constrain(d, 5, 10)

                        let strength = .00002 * ((m0 * m1)/ d**2)
                        let attr_force = v.multiplyScalar(strength)
                        //ADD TO BUILDING NODE FORCE
                        i_force.add(attr_force)
                        // //SCALE
                        // let _x = (Math.random() * 2 - 1) * .01
                        // let _y = (Math.random() * 2 - 1) * .01
                        // let _z = (Math.random() * 2 - 1) * .01
                        // force.x = _x
                        // force.y = _y
                        // force.z = _z
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


    //Frame Shut Down
    prevTime = time;
    renderer.render(scene, camera);
    frameIndex++;
}