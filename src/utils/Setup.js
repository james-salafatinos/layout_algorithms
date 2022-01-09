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
