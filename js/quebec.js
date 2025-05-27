import * as THREE from "three";
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

const width = window.innerWidth, height = window.innerHeight;
let rotateAxis = "z";

// Create renderer
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(width, height);
renderer.setClearColor(0x003DA5);
renderer.setPixelRatio(window.devicePixelRatio);
document.body.appendChild(renderer.domElement);

// Create scene
const scene = new THREE.Scene();

const whiteMaterial = new THREE.MeshPhysicalMaterial({
  color: 0xffffff,
  metalness: 0.05,
  roughness: 0.15,
  transmission: 0.85,
  opacity: 0.9,
  ior: 1.3,
  thickness: 0.03,
  envMapIntensity: 0.0,
  specularIntensity: 0.7,
  exposure: 0.99,
  side: THREE.DoubleSide
});

// Add bars
const barHeight = 10, barWidth = 0.75, barDepth = 0.8;

// Add cross
const crossShape = new THREE.Shape()
    .moveTo(barWidth / 2, barWidth / 2)
    .lineTo(barHeight, barWidth / 2)
    .lineTo(barHeight, -barWidth / 2)
    .lineTo(barWidth / 2, -barWidth / 2)
    .lineTo(barWidth / 2, -barHeight)
    .lineTo(-barWidth / 2, -barHeight)
    .lineTo(-barWidth / 2, -barWidth / 2)
    .lineTo(-barHeight, -barWidth / 2)
    .lineTo(-barHeight, barWidth / 2)
    .lineTo(-barWidth / 2, barWidth / 2)
    .lineTo(-barWidth / 2, barHeight)
    .lineTo(barWidth / 2, barHeight)
    .lineTo(barWidth / 2, barWidth / 2);
const cross = new THREE.ExtrudeGeometry(crossShape, {
  depth: barDepth,
  steps: 1,
  bevelEnabled: true,
  bevelSegments: 2,
  bevelThickness: 0.05,
  bevelSize: 0.05
});
const crossMesh = new THREE.Mesh(cross, whiteMaterial);
crossMesh.position.setZ(-barDepth / 2)
scene.add(crossMesh);


// Add point light
const light1 = new THREE.PointLight(0xffffff, 4);
light1.position.set(0, 1.5, 2.2);
// scene.add(light1)

// Add directional light
const dLight = new THREE.DirectionalLight(0xffffff, 3);
dLight.position.set(0, 3, 2.2);
scene.add(dLight);

// Add ambient light
const light2 = new THREE.AmbientLight(0xffffff, 1.5);
scene.add(light2);

// Add maple leaf
let fleurDeLisMeshes = [];
const loader = new GLTFLoader().setPath('https://cdn.glitch.global/7577af54-ca1c-4a24-8713-0c50a45a3283/');
loader.load('quebec-fleur-de-lis.glb', (gltf) => {
    const impScene = gltf.scene;
    const s = 20;
    impScene.scale.set(s, s, s);
    impScene.rotation.set(Math.PI / 2, 0, 0);
    impScene.position.set(0, 0, 0);
    // Apply red material
    impScene.traverse((child) => {
        if (child.isMesh) {
            child.material = whiteMaterial;
        }
    });  
  
    const p = Math.sqrt(width) / 12;
    const h = Math.sqrt(height) / 14;
    const ps = [ [p, h], [p, -h], [-p, -h], [-p, h] ];
  
    ps.forEach((p) => {
      const m = impScene.clone();
      m.position.set(p[0], p[1], 0);
      fleurDeLisMeshes.push(m);
      scene.add(m);
    })
  }
);

// Set the environment map for the scene
const cubeTextureLoader = new THREE.CubeTextureLoader().setPath('https://threejs.org/examples/textures/cube/Bridge2/');
const environmentMap = cubeTextureLoader.load([
    'posx.jpg', 'negx.jpg',
    'posy.jpg', 'negy.jpg',
    'posz.jpg', 'negz.jpg' 
]);
scene.environment = environmentMap;
// scene.background = environmentMap;


// Create camera
const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
camera.position.set(0, 0, 8);

// Helpers
const lightHelper = new THREE.PointLightHelper(light1);
// scene.add(lightHelper);

const controls = new OrbitControls(camera, renderer.domElement);

function rotateFluers() {
  if (rotateFluers.length < 0)
    return;
  
  fleurDeLisMeshes.forEach(m => {
    switch (rotateAxis) {
      case "x":
        m.rotation.x += 0.005;
        break;
      case "y":
        m.rotation.y += 0.003;
        break;
      case "z":
      default:
        m.rotation.z += 0.005;
        break;
    }
  })
  
  // crossMesh.rotation.y += 0.0025;
}


// Set up animation loop
function animate() {
  requestAnimationFrame(animate)
  rotateFluers();
  controls.update();
  renderer.render(scene, camera);
}

animate();


// Add click listener
/* *
document.addEventListener('click', () => {
  if (rotateAxis === "x") {
    rotateAxis = "y";
  } else if (rotateAxis === "y") {
    rotateAxis = "z"
  } else {
    rotateAxis = "x";
  }
});
/* */
