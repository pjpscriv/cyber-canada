import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { SVGLoader } from "three/addons/loaders/SVGLoader.js";

const width = window.innerWidth,
  height = window.innerHeight;
let rotateAxis = "y";

// Create renderer
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(width, height);
renderer.setClearColor(0xdddddd);
renderer.setPixelRatio(window.devicePixelRatio);
document.body.appendChild(renderer.domElement);

// Create scene
const scene = new THREE.Scene();

// Add bars
const barHeight = 10,
  barWidth = 0.75,
  barDepth = 0.8;

const shape = new THREE.Shape()
  .moveTo(1, 1)
  .lineTo(1, -1)
  .lineTo(-1, -1)
  .lineTo(-1, 1)
  .lineTo(1, 1)
  .closePath();

const extrudeSettings = {
  depth: barDepth,
  steps: 1,
  bevelEnabled: true,
  bevelSegments: 2,
  bevelThickness: 0.05,
  bevelSize: 0.05,
};
const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
// const material = getGlassMaterial(0xffffff);
// const mesh = new THREE.Mesh(geometry, material);
// mesh.position.setZ(-barDepth / 2);
// scene.add(mesh);

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

function getGlassMaterial(color) {
  return new THREE.MeshPhysicalMaterial({
    color: color,
    metalness: 0.15,
    roughness: 0.05,
    transmission: 0.75,
    opacity: 0.9,
    ior: 1.3,
    thickness: 0.03,
    envMapIntensity: 0.0,
    specularIntensity: 1.0,
    // exposure: 0.99,
    side: THREE.DoubleSide
  });
}

function isNegligbleColorDiff(c) {
  const threshold = 0.01
  const rgDiff = Math.abs(c.r - c.g);
  const rbDiff = Math.abs(c.r - c.b);
  const gbDiff = Math.abs(c.g - c.b);
  return rgDiff < threshold && rbDiff < threshold && gbDiff < threshold;
}

function getSymbolMesh(data) {
  const group = new THREE.Group();
  const scale = 0.01;
  const colorDepth = 30;
  const outlineDepth = 40;

  data.paths.forEach((path, i) => {
    const isOutline = isNegligbleColorDiff(path.color);
    const mat = getGlassMaterial(path.color);
    
    path.toShapes(isOutline).forEach((shape) => {
      const geo = new THREE.ExtrudeGeometry(shape, { depth: isOutline ? outlineDepth : colorDepth });
      const shapeMesh = new THREE.Mesh(geo,  mat);
      const shift = (outlineDepth - colorDepth) * scale;
      shapeMesh.position.z = isOutline ? 0 : shift / 2;
      shapeMesh.scale.set(scale, -scale, scale)
      group.add(shapeMesh);
    });
  });
  
  // Offset all of group's elements, to center them
  const box = new THREE.Box3().setFromObject(group);
  const groupSize = new THREE.Vector3();
  box.getSize(groupSize);
  group.children.forEach(item => {
    item.position.x = groupSize.x / -2;
    item.position.y = groupSize.y / 2;
    item.position.z -= groupSize.z / 2;
  });

  return group;
}


let importedMeshes = [];
const loader = new SVGLoader().setPath("/svg/");

// Add pin blanc
loader.load("pin-blanc.svg", (data) => {
  const mesh = getSymbolMesh(data);
  mesh.position.set(2.7, 0, 0)
  scene.add(mesh);
  importedMeshes.push(mesh);
});


// Add trefle
loader.load("trefle.svg", (data) => {
  const mesh = getSymbolMesh(data);
  mesh.position.set(1, -1, 0)
  scene.add(mesh);
  importedMeshes.push(mesh);
});

// Add rose
loader.load("rose.svg", (data) => {
  const mesh = getSymbolMesh(data);
  mesh.position.set(1, 1, 0)
  scene.add(mesh);
  importedMeshes.push(mesh);
});

// Add chardon
loader.load("chardon.svg", (data) => {
  const mesh = getSymbolMesh(data);
  mesh.position.set(-1, -1, 0)
  scene.add(mesh);
  importedMeshes.push(mesh);
});

// Add fleur de lis
loader.load("montreal-fleur-de-lis.svg", (data) => {
  const mesh = getSymbolMesh(data);
  mesh.position.set(-1, 1, 0)
  scene.add(mesh);
  importedMeshes.push(mesh);
});



const speed = 0.01;

// Set the environment map for the scene
const cubeTextureLoader = new THREE.CubeTextureLoader().setPath("https://threejs.org/examples/textures/cube/Bridge2/");
const environmentMap = cubeTextureLoader.load([ "posx.jpg", "negx.jpg", "posy.jpg", "negy.jpg", "posz.jpg", "negz.jpg" ]);
scene.environment = environmentMap;
// scene.background = environmentMap;

// Create camera
const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
camera.position.set(0, 0, 8);

// Helpers
const lightHelper = new THREE.PointLightHelper(light1);
// scene.add(lightHelper);

const controls = new OrbitControls(camera, renderer.domElement);

function rotateimportedModels() {
  if (importedMeshes.length < 0) return;

  importedMeshes.forEach((m) => {
    switch (rotateAxis) {
      case "x":
        m.rotation.x += speed;
        break;
      case "y":
        m.rotation.y += speed;
        break;
      case "z":
      default:
        m.rotation.z += speed;
        break;
    }
  });

  // crossMesh.rotation.y += 0.0025;
}

// Set up animation loop
function animate() {
  requestAnimationFrame(animate);
  rotateimportedModels();
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
