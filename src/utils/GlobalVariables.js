

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
