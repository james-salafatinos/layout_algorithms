

//THREE JS
let camera, scene, renderer, composer
let stats;
//CONTROLS & INTERACTIONS
let controls;
let moveForward = false;
let moveBackward = false;
let moveLeft = false;
let moveRight = false;
let moveUp = false;
let moveDown = false;
let raycaster;
let lookDir = new THREE.Vector3()
let pointer = new THREE.Vector2();

//STATE
let cameraState = {isCameraFollowing: true}
let raycastState = {offset: -1}
let isDragging = false;
let isZoomHolding = false;
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
let physicsObjectsCreated = false
let physicsObjects = []
let physicsObjectsMesh = [];
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

const bloomParams = {
    exposure: 1,
    bloomStrength: 1.5,
    bloomThreshold: 2,
    bloomRadius: .7
};
// FUNCTIONS
let mouseDown
let mouseMove
let mouseUp
let getPointer
let setRaycaster
let cameraLookDir
let setZoom
let constrain
let follow
