import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import Stats from 'three/addons/libs/stats.module.js'
import { GUI } from 'three/addons/libs/lil-gui.module.min.js'
import RAPIER from '@dimforge/rapier3d-compat'
import { FirstPersonControls } from 'three/examples/jsm/Addons.js'

await RAPIER.init()
const gravity = new RAPIER.Vector3(0.0, -20, 0.0)
const world = new RAPIER.World(gravity)
const dynamicBodies = []

const scene = new THREE.Scene()

const settings = {
  shadowMapType: "basic",
  physicallyCorrectLights: false,
  shadowMapSize: 2056,
  shadowRadius: 5
}


const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 5000)
camera.position.set(0, 2, 5)

const renderer = new THREE.WebGLRenderer({ antialias: true })
renderer.setSize(window.innerWidth, window.innerHeight)
renderer.shadowMap.enabled = true
renderer.shadowMap.type = THREE.VSMShadowMap
document.body.appendChild(renderer.domElement)

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight
  camera.updateProjectionMatrix()
  renderer.setSize(window.innerWidth, window.innerHeight)
})

const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.x += 20
directionalLight.position.y += 20
directionalLight.position.z += 20
directionalLight.castShadow = true
directionalLight.shadow.mapSize.width = settings.shadowMapSize;
directionalLight.shadow.mapSize.height = settings.shadowMapSize;
directionalLight.shadow.radius = settings.shadowRadius;
directionalLight.shadow.bias = -0.01;
// directionalLight.shadow.blurSamples = 500
const d = 25;
directionalLight.shadow.camera.near = 0.5
directionalLight.shadow.camera.far = 60
directionalLight.shadow.camera.left = - d;
directionalLight.shadow.camera.right = d;
directionalLight.shadow.camera.top = d;
directionalLight.shadow.camera.bottom = - d;
scene.add(directionalLight);

const controls = new FirstPersonControls(camera, renderer.domElement)
controls.lookSpeed = 0.02
controls.movementSpeed = 5

const cubeMesh = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), new THREE.MeshBasicMaterial({color: 0x00ff00}))
cubeMesh.castShadow = true
scene.add(cubeMesh)
const cubeBody = world.createRigidBody(RAPIER.RigidBodyDesc.dynamic().setTranslation(0, 5, 0).setCanSleep(false))
const cubeShape = RAPIER.ColliderDesc.cuboid(0.5, 0.5, 0.5).setMass(2).setRestitution(0.8)
world.createCollider(cubeShape, cubeBody)
dynamicBodies.push([cubeMesh, cubeBody])

const ballMesh = new THREE.Mesh(new THREE.SphereGeometry(0.5), new THREE.MeshNormalMaterial)
ballMesh.castShadow = true
scene.add(ballMesh)
const ballBody = world.createRigidBody(RAPIER.RigidBodyDesc.dynamic().setTranslation(-2, 5, 0).setCanSleep(false).setLinearDamping(0.5).setAngularDamping(1))
const ballShape = RAPIER.ColliderDesc.ball(0.5).setMass(1).setMass(0.5).setRestitution(1.1)
world.createCollider(ballShape, ballBody)
dynamicBodies.push([ballMesh, ballBody])

const targetMesh = new THREE.Mesh(new THREE.BoxGeometry(4, 5, 1), new THREE.MeshStandardMaterial({color: 0xffffff, metalness: 1, roughness: 1}))
targetMesh.castShadow = true
targetMesh.position.set(-2, 3, -30)
scene.add(targetMesh)
const targetBody = world.createRigidBody(RAPIER.RigidBodyDesc.fixed().setTranslation(-2, 3, -30))
const targetShape = RAPIER.ColliderDesc.cuboid(2, 5, 0.5)
world.createCollider(targetShape, targetBody)

const floorMesh = new THREE.Mesh(new THREE.BoxGeometry(100, 1, 300), new THREE.MeshPhongMaterial())
floorMesh.receiveShadow = true
floorMesh.position.y = -1
scene.add(floorMesh)
const floorBody = world.createRigidBody(RAPIER.RigidBodyDesc.fixed().setTranslation(0, -1, 0))
const floorShape = RAPIER.ColliderDesc.cuboid(50, 0.5, 150)
world.createCollider(floorShape, floorBody)

const raycaster = new THREE.Raycaster()
const mouse = new THREE.Vector2()

const exitVelo = {
  x: 0,
  y: 0,
  z: 40
}

document.addEventListener('keydown', function(e) {
  if (e.key === 'e') {
    ballBody.setLinvel(new RAPIER.Vector3(0, 0, 0), true)
    ballBody.setTranslation(new RAPIER.Vector3(-2, 5, 50), true)
    ballBody.applyImpulse(new RAPIER.Vector3(0, 0, -80), true)
  }

  if (e.key === 'r') {
    ballBody.setLinvel(new RAPIER.Vector3(0, 0, 0), true)
    ballBody.setTranslation(new RAPIER.Vector3(-2, 3, -28), true)
    ballBody.applyImpulse(new RAPIER.Vector3(exitVelo.x, exitVelo.y, exitVelo.z))
  }
})

renderer.domElement.addEventListener('click', (e) => {
   mouse.set(
     (e.clientX / renderer.domElement.clientWidth) * 2 - 1,
     -(e.clientY / renderer.domElement.clientHeight) * 2 + 1
   )

   raycaster.setFromCamera(mouse, camera)

   const intersects = raycaster.intersectObjects(
     [cubeMesh, ballMesh],
     false
   )

   if (intersects.length) {
     dynamicBodies.forEach((b) => {
      b[0] === intersects[0].object && b[1].applyImpulse(new RAPIER.Vector3(0, 10, 0), true)
    })
  }
})

ballBody.applyImpulse(new RAPIER.Vector3(0, 0, -50), true)

const stats = new Stats()
document.body.appendChild(stats.dom)

const gui = new GUI()

const ballFolder = gui.addFolder('Ball Exit Direction Velos')
ballFolder.add(exitVelo, 'x', 0, 100, 1)
ballFolder.add(exitVelo, 'y', 0, 100, 1)
ballFolder.add(exitVelo, 'z', 0, 100, 1)

const clock = new THREE.Clock()
let delta

function animate() {
  requestAnimationFrame(animate)

  delta = clock.getDelta()
  world.timestep = Math.min(delta, 0.1)
  world.step()

  for (let i = 0, n = dynamicBodies.length; i < n; i++) {
    dynamicBodies[i][0].position.copy(dynamicBodies[i][1].translation())
    dynamicBodies[i][0].quaternion.copy(dynamicBodies[i][1].rotation())
  }

  controls.update(0.1)

  renderer.render(scene, camera)

  stats.update()
}

animate()

const shadowsFolder = gui.addFolder('Shadows')
shadowsFolder.add( settings, 'shadowMapType', ["basic", "pcf","pcfsoft", "vsm"])
    .onChange( value => {
        switch (value) {
          case 'basic':
            renderer.shadowMap.type = THREE.BasicShadowMap;
            break;
          case 'pcf':
            renderer.shadowMap.type = THREE.PCFShadowMap;
            break;
          case 'pcfsoft':
            renderer.shadowMap.type = THREE.PCFSoftShadowMap;
            break;
          case 'vsm':
            renderer.shadowMap.type = THREE.VSMShadowMap;
            break;
          default:
            console.log('Invalid shadow map type');
        }
        console.log(renderer.shadowMap.type)
    } );
shadowsFolder.add(settings, "physicallyCorrectLights")
    .onChange( value => {
        renderer.physicallyCorrectLights = settings.physicallyCorrectLights
    })
shadowsFolder.add( settings, 'shadowMapSize', 0, 12000, 200 )
    .onChange( value => {
        directionalLight.shadow.map.dispose(); // important
        directionalLight.shadow.mapSize = new THREE.Vector2(value,value)
    })

shadowsFolder.add( settings, 'shadowRadius', 0, 100, 1 )
.onChange( value => {
    directionalLight.shadow.radius = value;
    directionalLight.shadow.updateMatrices(directionalLight);
})