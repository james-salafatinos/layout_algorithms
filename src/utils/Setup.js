function setup() {
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 1000);
    camera.position.y = 10;
    camera.position.z = 30;
    camera.position.x = 30;
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0000f);
    scene.fog = new THREE.Fog(0xffffff, 100, 750);

    const light = new THREE.HemisphereLight(0xeeeeff, 0x777788, 0.75);
    light.position.set(0.5, 1, 0.75);
    scene.add(light);

    controls = new PointerLockControls(camera, document.body);

    const blocker = document.getElementById('blocker');
    const instructions = document.getElementById('instructions');
    
    
    const container = document.getElementById( 'container' );
    stats = new Stats();
    container.appendChild( stats.dom );

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
    cameraFolder.add(cameraState, 'isCameraFollowing')
    cameraFolder.open()

    const raycastFolder = gui.addFolder('Raycast')
    raycastFolder.add(raycastState, 'offset')
    raycastFolder.open()

    const bloomFolder = gui.addFolder('Bloom')
    bloomFolder.add(bloomParams, 'exposure', 0.1, 2).onChange(function (value) {

        renderer.toneMappingExposure = Math.pow(value, 4.0);

    });

    bloomFolder.add(bloomParams, 'bloomThreshold', 0.0, 1.0).onChange(function (value) {

        bloomPass.threshold = Number(value);

    });

    bloomFolder.add(bloomParams, 'bloomStrength', 0.0, 3.0).onChange(function (value) {

        bloomPass.strength = Number(value);

    });

    bloomFolder.add(bloomParams, 'bloomRadius', 0.0, 1.0).step(0.01).onChange(function (value) {

        bloomPass.radius = Number(value);

    });



    scene.add(new THREE.AmbientLight(0x404040));

    // const pointLight = new THREE.PointLight(0xffffff, .4);
    // camera.add(pointLight);
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    const renderScene = new RenderPass(scene, camera);

    const bloomPass = new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 1.5, 0.4, 0.85);
    bloomPass.threshold = bloomParams.bloomThreshold;
    bloomPass.strength = bloomParams.bloomStrength;
    bloomPass.radius = bloomParams.bloomRadius;

    composer = new EffectComposer(renderer);

    composer.addPass(renderScene);
    composer.addPass(bloomPass);

}
