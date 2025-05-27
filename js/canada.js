import * as THREE from "three";
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

const width = window.innerWidth, height = window.innerHeight;
let rotateAxis = "z";

// Create renderer
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(width, height);
renderer.setClearColor(0xffffff);
renderer.setPixelRatio(window.devicePixelRatio);
document.body.appendChild(renderer.domElement);

// Create scene
const scene = new THREE.Scene();

// Add box
const barHeight = 10, barWidth = 8, barDepth = 0.8, barOffset = 6.2;
const redMaterial = new THREE.MeshPhysicalMaterial({
  color: 0xff0000,
  metalness: 0.05,
  roughness: 0.0,
  transmission: 1,
  opacity: 1,
  ior: 1.5,
  thickness: 0.03,
  envMapIntensity: 0.0,
  specularIntensity: 0.8,
  exposure: 0.99,
  side: THREE.DoubleSide
});

// Add left bar
const bar1 = new THREE.BoxGeometry(barWidth, barHeight, barDepth);
const barMesh1 = new THREE.Mesh(bar1, redMaterial);
barMesh1.position.set(-barOffset, 0, 0)
scene.add(barMesh1);

// Add right bar
const bar2 = new THREE.BoxGeometry(barWidth, barHeight, barDepth);
const barMesh2 = new THREE.Mesh(bar2, redMaterial);
barMesh2.position.set(barOffset, 0, 0)
scene.add(barMesh2);

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
let leafMesh = null;
const loader = new GLTFLoader().setPath('https://cdn.glitch.global/7577af54-ca1c-4a24-8713-0c50a45a3283/');
loader.load('maple_leaf.glb', (gltf) => {
    const impScene = gltf.scene;
    const s = 15;
    impScene.scale.set(s, s, s);
    impScene.rotation.set(Math.PI / 2, 0, 0);
    impScene.position.set(0, 0, 0);
    // Apply red material
    impScene.traverse((child) => {
        if (child.isMesh) {
            child.material = redMaterial;
        }
    });  
    scene.add(impScene);
    leafMesh = impScene;
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

function rotateLeaf() {
  if (leafMesh) {
    switch (rotateAxis) {
      case "x":
        leafMesh.rotation.x += 0.005;
        break;
      case "y":
        leafMesh.rotation.y += 0.003;
        break;
      case "z":
      default:
        leafMesh.rotation.z += 0.005;
        break;
    }
  }
}


// Set up animation loop
function animate() {
  requestAnimationFrame(animate)
  rotateLeaf();
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
