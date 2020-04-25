import React, {useState} from 'react';
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { setContent, showEdges, setEdgeColor, setEdgeWidth } from '@bit/benolayinka.benolayinka.utils'
import ThreeSceneRenderer from '@bit/benolayinka.benolayinka.three-scene-renderer'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { Interaction } from 'three.interaction';
import ReactHowler from 'react-howler';
import { CSSTransition } from 'react-transition-group'
import Emoji from '@bit/benolayinka.benolayinka.emoji'

const NEAR = 0.01, FAR = 1000, FOV = 60, ASPECT = 16/9

function App() {

	const [playing, setPlaying] = useState(false);
	const [showLoading, setShowLoading] = useState(true);
	const [showLoadingText, setShowLoadingText] = useState(true);

  	var canvas, renderer, scene, camera, clock, mixer, controls

  	var salsa, dribble, run, actions

	var interaction

  	var character

  	var pos = {}

  	var rot = {
  		run: Math.PI*2 / 360 * 190,
  	}

  	var materials = [], parameters

  	function extendScene(props){

  		//trigger onLoaded callback when all assets are loaded
	    THREE.DefaultLoadingManager.onLoad = () => {
	        setShowLoadingText(false)
		};

		({canvas, renderer} = props)

		scene = new THREE.Scene()

	  	camera = new THREE.PerspectiveCamera(FOV, ASPECT, NEAR, FAR);

	  	controls = new OrbitControls(camera, renderer.domElement);

		clock = new THREE.Clock()

		interaction = new Interaction(renderer, scene, camera);

	  	//scene.background = new THREE.Color('red');

	  	var avatar = new THREE.Object3D()

	  	scene.add(avatar)

	  	let loader = new GLTFLoader()

	  	loader.load('assets/coach-animated.glb', (gltf)=>{

	  		gltf.scene.traverse((mesh)=>{

	  			if(mesh.userData.character){
	  				character = mesh
	  			}

	  			if(mesh.userData.pos){
	  				mesh.cursor = 'pointer'
	  				mesh.on('click', function(ev) {});
	  				pos[mesh.userData.pos] = mesh.position
	  			}

				if(mesh.isSkinnedMesh) {
					const helper = new THREE.BoxHelper(mesh);
					helper.visible = false
					avatar.add(helper)
				}
	  		})

			mixer = new THREE.AnimationMixer( gltf.scene );

			dribble = mixer.clipAction(gltf.animations[0])
			run = mixer.clipAction(gltf.animations[1])
			salsa = mixer.clipAction(gltf.animations[2])

			actions = [salsa, dribble, run]

			var i = 0

			window.addEventListener("click", ()=>{playAction(actions[++i%3])})

			playAction(salsa)

			scene.add(gltf.scene)

			setContent(avatar, camera, controls)

			controls.autoRotate = true
			controls.autoRotateSpeed = 0.7
			controls.zoomSpeed = 0.2
			controls.rotateSpeed = 0.2
			camera.near = 0.01
			camera.updateProjectionMatrix()
			camera.position.z += 6

			//floor
			var mesh = new THREE.Mesh( new THREE.PlaneBufferGeometry( 30, 20 ), new THREE.MeshBasicMaterial( { color: 'pink', side: THREE.DoubleSide} ) );
			showEdges(mesh)
			setEdgeColor('white')
			setEdgeWidth(3)
			mesh.rotation.x = - Math.PI / 2;
			scene.add( mesh );
	  	})

	  	let spotLight = new THREE.SpotLight('pink', 1)
	  	spotLight.position.set(45, 50, 15);
	  	scene.add(spotLight);

	  	let ambLight = new THREE.AmbientLight('pink', 1);
	  	ambLight.position.set(5, 3, 5);
	  	//scene.add(ambLight);

	  	var light = new THREE.HemisphereLight( 'white', 'pink', 1 );
	  	scene.add(light)

		window.addEventListener('resize', handleWindowResize)

	  	handleWindowResize()

	  	animate()
  	}

  	function playAction(action){
  		actions.forEach(action=>{
  			action.stop()
  		})
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

	return (
		<div className="App h-100 w-100 position-absolute bg-color">
			<CSSTransition
					in={showLoading}
					unmountOnExit
					timeout={1200}
					classNames="fade"
			>
				<div className='h-100 w-100 position-absolute z-9 bg-color d-flex flex-column justify-content-center align-items-center'>
					<CSSTransition
							in={showLoadingText}
							unmountOnExit
							timeout={1200}
							classNames="fade"
							onExited={()=>{setShowLoading(false)}}
					>
						<div className = 'd-flex justify-content-center'>
							<svg width="100" className='w-25 bounce p-4'>
						    	<circle cx={50} cy={50} r={10} />
							</svg>
							<svg width="100" className='m-0 w-25 bounce p-4'>
						    	<circle cx={50} cy={50} r={10} />
							</svg>
							<svg width="100" className='m-0 w-25 bounce p-4'>
						    	<circle cx={50} cy={50} r={10} />
							</svg>
						</div>
					</CSSTransition>
				</div>
			</CSSTransition>
			<div className="h-100 w-100 position-absolute text-color d-flex justify-content-center align-items-center">
				<h1 className = "grow">keep the fire burning!</h1>
			</div>
			<div className = 'z-8 bottom d-flex justify-content-center'>
				<button 
					className='btn-naked'
					onClick={onPlayButton}
				>
					{
					playing ?
					<h2 className = 'play play-active'><Emoji symbol="🔈" label="play"/></h2>
					:
					<h2 className = 'play'><Emoji symbol="🔈" label="stop"/></h2>
					}
				</button>
			</div>
			<ReactHowler
				src="/assets/burn.mp3"
				playing={playing}
				loop={true}
			  />
			<ThreeSceneRenderer 
				className='h-100 w-100 position-absolute' 
				adaptToDeviceRatio 
				onMount={extendScene}
			/>
		</div>
	);
}

export default App;
