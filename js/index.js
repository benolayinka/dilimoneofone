import * as THREE from '/js/libs/three.module.min.js';

import { OrbitControls } from '/js/libs/OrbitControls.js';

import { GLTFLoader } from '/js/libs/GLTFLoader.js';

import { Interaction } from '/js/libs/three.interaction.module.js';

import { LineMaterial } from '/js/libs/LineMaterial.js';
import { LineSegmentsGeometry } from '/js/libs/LineSegmentsGeometry.js';
import { LineSegments2 } from '/js/libs/LineSegments2.js';

const NEAR = 0.01, FAR = 1000, FOV = 60, ASPECT = 16/9

var material =  new LineMaterial( {
    color: 'black',
    linewidth: 1, // in pixels
    resolution:  new THREE.Vector2(window.innerWidth, window.innerHeight),// to be set by renderer, eventually
    dashed: false
  } );

var actions //fucking js

var canvas, renderer, scene, camera, mixer, controls, clock

var spotLight, ambLight, light

var salsa, dribble, run

var ball, ballAction

var actionMap

var interaction

var character

var pos = {}

var rot = {
  run: Math.PI*2 / 360 * 190,
}

var materials = [], parameters

var sound = new Howl({
  src: ['/assets/burn.mp3'],
  loop: true,
});

var soundButton = document.getElementById("sound-button")

var playing = false

soundButton.addEventListener("click", function() {
  if(playing){
    sound.pause()
    soundButton.classList.remove("play-active")
  }
  else {
    sound.play()
    soundButton.classList.add("play-active")
  }
  playing = !playing
});

var moveButton = document.getElementById("move-button")

moveButton.addEventListener("click", sceneClick);

var loadingScreen = document.getElementById("loading-screen")

init();
animate();

function init() {

  // SCENE

  scene = new THREE.Scene()

  // FLOOR

  var floor = new THREE.Mesh( new THREE.PlaneBufferGeometry( 30, 20 ), new THREE.MeshBasicMaterial( { color: 'pink', side: THREE.DoubleSide} ) );
  floor.cursor = 'pointer'
  function playSalsa(ev){
    ev.stopPropagation()
      playAction(salsa)
  }
  floor.on('click', playSalsa);
  floor.on('touchstart', playSalsa)
  showEdges(floor)
  setEdgeColor('white')
  setEdgeWidth(3)
  floor.rotation.x = - Math.PI / 2;
  scene.add( floor );

  // CAMERA

  camera = new THREE.PerspectiveCamera(FOV, ASPECT, NEAR, FAR);

  renderer = new THREE.WebGLRenderer( { antialias: true, alpha: true } );
  renderer.setPixelRatio( window.devicePixelRatio );
  renderer.setSize( window.innerWidth, window.innerHeight );

  // LIGHTS

  spotLight = new THREE.SpotLight('pink', 1)
  spotLight.position.set(45, 50, 15);
  scene.add(spotLight);

  ambLight = new THREE.AmbientLight('pink', 1);
  ambLight.position.set(5, 3, 5);
  //scene.add(ambLight);

  light = new THREE.HemisphereLight( 'white', 'pink', 1 );
  scene.add(light)

  // CONTROLS

  controls = new OrbitControls(camera, renderer.domElement);

  // CLOCK

  clock = new THREE.Clock()

  // AVATAR

  interaction = new Interaction(renderer, scene, camera);

  var avatar = new THREE.Object3D()

  scene.add(avatar)

  let loader = new GLTFLoader()

  loader.load('assets/coach-animated.glb', (gltf)=>{

    gltf.scene.traverse((mesh)=>{

      if(mesh.userData.character){
        character = mesh
      }

      if(mesh.userData.ball){
        ball = mesh
      }

      if(mesh.userData.pos){
        mesh.cursor = 'pointer'

        function onClick(ev) {
          ev.stopPropagation()
          playAction(actionMap[mesh.userData.pos])
        }

        mesh.on('click', onClick);
        mesh.on('touchstart', onClick)

        pos[mesh.userData.pos] = mesh.position

        console.log(mesh.userData.pos)
      }

    if(mesh.isSkinnedMesh) {
        mesh.frustumCulled = false
        const helper = new THREE.BoxHelper(mesh);
        helper.visible = false

        avatar.add(helper)
      }
    })

    // ACTIONS

    mixer = new THREE.AnimationMixer( gltf.scene );

    dribble = mixer.clipAction(gltf.animations[0])
    run = mixer.clipAction(gltf.animations[1])
    salsa = mixer.clipAction(gltf.animations[2])

    ballAction = mixer.clipAction(gltf.animations[3])

    actions = [salsa, dribble, run]

    actionMap = {
        'salsa': salsa,
        'dribble': dribble,
        'run': run,
      }

    playAction(salsa)

    scene.add(gltf.scene)

    setContent(gltf.scene, camera, controls)

    controls.autoRotate = true
    controls.autoRotateSpeed = 0.7
    controls.zoomSpeed = 0.2
    controls.rotateSpeed = 0.2
    camera.near = 0.01
    camera.updateProjectionMatrix()
    camera.position.z += 6

    var closeLoading = setTimeout(() => {loadingScreen.classList.add("fade-out")}, 100);
  })

  document.body.appendChild( renderer.domElement );

  window.addEventListener( 'resize', onWindowResize, false );

  onWindowResize()

  function loadAsset( asset ) {

    var format = asset.formats.find( format => { return format.formatType === 'GLTF2'; } );

    if ( format !== undefined ) {

      var url = format.root.url;

      var loader = new GLTFLoader();

      loader.load(
        // resource URL
        url,
        // called when the resource is loaded
        function ( gltf ) {

          scene.add( gltf.scene );

          object = gltf.scene;
          object.scale.multiplyScalar( 20 );

          render()

        },
        // called while loading is progressing
        function ( xhr ) {

          const element = document.getElementById("loading");

          element.classList.add("hide");
        },

        // called when loading has errors
        function ( error ) {

          console.log( 'An error happened' );

        }
      );

    }

  }

}

function onWindowResize() {

  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize( window.innerWidth, window.innerHeight );

  renderer.render(scene, camera)

}

function playAction(action){
    actions.forEach(action=>{
      action.stop()
    })
    ballAction.stop()
    ball.visible = false
    if(action === salsa){
      character.position.copy(pos['salsa'])
      character.rotation.z = 0
    } else if (action === run){
      character.position.copy(pos['run'])
      character.rotation.z = rot['run']
    }
    else if (action === dribble){
      character.position.copy(pos['dribble'])
      character.rotation.z = 0
      ballAction.play()
      ball.visible = true
    }
    action.play()
  }

function handleWindowResize(){

  let width = canvas.clientWidth;
  let height = canvas.clientHeight;
  camera.aspect = width/height;
  camera.updateProjectionMatrix();

}

function animate(){

  var delta = clock.getDelta();

  if(mixer){
      mixer.update(delta)
  }

    controls.update();

  renderer.render(scene, camera)

  requestAnimationFrame(animate)
}

function onPlayButton(){

  setPlaying(!playing)

}

var i = 0

function sceneClick(){

  playAction(actions[++i%3])

}

function setContent(object, camera, controls, width, height, offset){

    const box = new THREE.Box3().setFromObject(object);
    const size = box.getSize(new THREE.Vector3()).length();
    const center = box.getCenter(new THREE.Vector3());

    camera.near = size / 10;
    camera.far = size * 10;
    camera.updateProjectionMatrix();

    camera.position.copy(center);
    camera.lookAt(center);

    if(offset) {
        camera.position.set(offset.x, offset.y, offset.z)
    } else {
        camera.position.z += size
    }

    if(controls){
        controls.target.copy(center)
        controls.minDistance = size / 10;
        controls.maxDistance = size * 10;
    }

}

function showEdges(mesh){
    let edges = new THREE.EdgesGeometry( mesh.geometry, 45 );
    let geometry = new LineSegmentsGeometry().fromEdgesGeometry( edges );
    let lines = new LineSegments2(geometry, material);
    mesh.add(lines); 
}

function setEdgeWidth(width){
    material.linewidth = width;
}

function setDashed(dashed){
    material.dashed = dashed
}

function setEdgeColor(color){
    material.color.set(color)
}