class Node {
    constructor(m, x, y, z, offset, ivx = 0, ivy = 0, ivz = 0, massScalar = 1) {
        this.mass = m
        this.pos = new THREE.Vector3(x, y, z)
        this.velocity = new THREE.Vector3(0, 0, 0)
        this.acceleration = new THREE.Vector3(ivx, ivy, ivz)
        this.dirVector = new THREE.Vector3()
        this.mesh
        this.lookDir
        this.hasBeenRaycast
        this.offset = offset
        this.massScalar = massScalar
    }
    createSphere() {
        let mat = new THREE.MeshPhongMaterial({
            wireframe: false,
            transparent: false,
            depthTest: true,
            side: THREE.DoubleSide
        });
        let geo = new THREE.SphereGeometry(this.mass * this.massScalar, 5, 5)
        let mesh = new THREE.Mesh(geo, mat)
        mesh.position.x = this.x
        mesh.position.y = this.y
        mesh.position.z = this.z


        mesh.userData.offset = this.offset
        console.log("Node.js", this.offset)

        this.mesh = mesh
        return mesh
    }
    updateGeometry = function () {
        // console.log(this.pos)
        this.mesh.position.x = this.pos.x
        this.mesh.position.y = this.pos.y
        this.mesh.position.z = this.pos.z

        if (this.mesh.userData.hasBeenRaycast) {
        
            this.mesh.material.color = new THREE.Color(`hsl(${50}, 100%, 100%)`);

        } else{
            this.mesh.material.color = new THREE.Color(`hsl(${200 - (-1 * this.velocity.length()) * 10 ** 3}, 100%, 50%)`);
        }


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

    getDistanceTo = function (otherObject) {
        var distance = this.pos.distanceTo(otherObject.pos);
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
        // // Trekkkraften: Jo st??rre masse jo st??rre kraft. Jo lenger avstand jo mindre kraft
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


