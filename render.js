const scene = new THREE.Scene();
scene.background = new THREE.Color(0xeeeeee);

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / (window.innerHeight * 0.7), 0.1, 100);
camera.position.set(0.4, 0.4, 0.8);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, (window.innerHeight * 0.7));
document.getElementById("viewer-container").appendChild(renderer.domElement);

const controls = new THREE.OrbitControls(camera, renderer.domElement);

const colors = { 'C': 0x333333, 'H': 0xffffff };
const radii  = { 'C': 0.03, 'H': 0.02 };

const bonds = [
    [0, 1], [0, 5], [0, 14], [0, 15],
    [1, 2], [1, 12], [1, 13],
    [2, 3], [2, 10], [2, 11],
    [3, 4], [3, 8], [3, 9],
    [4, 5], [4, 16], [4, 17],
    [5, 6], [5, 7],
    [17, 18], [17, 19], [17, 20]
];

const atomMeshes = [];
const bondMeshes = [];

function renderMolecule() {
    // Remove existing atoms and bonds
    for (const mesh of [...atomMeshes, ...bondMeshes]) {
        scene.remove(mesh);
    }
    atomMeshes.length = 0;
    bondMeshes.length = 0;

    // Compute center
    const center = molecules[selected].reduce((acc, atom) => {
        acc.x += atom.x;
        acc.y += atom.y;
        acc.z += atom.z;
        return acc;
    }, { x: 0, y: 0, z: 0 });

    center.x /= molecules[selected].length;
    center.y /= molecules[selected].length;
    center.z /= molecules[selected].length;

    // Add atoms
    for (const { el, x, y, z } of molecules[selected]) {
        const geo = new THREE.SphereGeometry(radii[el], 32, 32);
        const mat = new THREE.MeshPhongMaterial({ color: colors[el] });
        const sphere = new THREE.Mesh(geo, mat);
        sphere.position.set(x - center.x, y - center.y, z - center.z);
        scene.add(sphere);
        atomMeshes.push(sphere);
    }

    // Add bonds
    const bondMat = new THREE.MeshPhongMaterial({ color: 0xaaaaaa });

    for (const [i, j] of bonds) {
        const a = atomMeshes[i].position;
        const b = atomMeshes[j].position;
        const dir = new THREE.Vector3().subVectors(b, a);
        const length = dir.length();
        const mid = new THREE.Vector3().addVectors(a, b).multiplyScalar(0.5);

        const bondGeo = new THREE.CylinderGeometry(0.005, 0.005, length, 8);
        const bond = new THREE.Mesh(bondGeo, bondMat);

        bond.position.copy(mid);
        bond.lookAt(b);
        bond.rotateX(Math.PI / 2);

        scene.add(bond);
        bondMeshes.push(bond);
    }
}

const light = new THREE.PointLight(0xffffff, 1);
light.position.set(10, 10, 10);
scene.add(light);

const ambient = new THREE.AmbientLight(0x404040);
scene.add(ambient);

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / (window.innerHeight * 0.7);
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, (window.innerHeight * 0.7));
    document.getElementById("text-container").setSize(window.innerHeight * 0.3)
});

function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
}

renderMolecule();
animate();
