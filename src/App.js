import React from 'react';
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { setContent } from '@bit/benolayinka.benolayinka.utils'
import ThreeSceneRenderer from '@bit/benolayinka.benolayinka.three-scene-renderer'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

const NEAR = 0.01, FAR = 1000, FOV = 60, ASPECT = 16/9

function App() {

  	var canvas, renderer, scene, camera, clock, mixer, controls

  	var skinnedMeshes = []

  	function extendScene(props){

		({canvas, renderer} = props)

		scene = new THREE.Scene()

	  	camera = new THREE.PerspectiveCamera(FOV, ASPECT, NEAR, FAR);

	  	controls = new OrbitControls(camera, renderer.domElement);

		clock = new THREE.Clock()

	  	scene.background = new THREE.Color('red');

	  	let loader = new GLTFLoader()
	  	loader.load('assets/coach-animated.glb', (gltf)=>{
	  		gltf.scene.traverse((mesh)=>{
				if(mesh.isSkinnedMesh) {
					skinnedMeshes.push(mesh)
					const helper = new THREE.BoxHelper(mesh);
					helper.update()
					scene.add(helper)
				}
	  		})
			mixer = new THREE.AnimationMixer( gltf.scene );
	 		var action = mixer.clipAction( gltf.animations[ 0 ] );
	  		action.play();
			scene.add(gltf.scene)
			setContent(scene, camera, controls)
	  	})

	  	let spotLight = new THREE.SpotLight(0xffffff, 0.9)
	  	spotLight.position.set(45, 50, 15);
	  	scene.add(spotLight);

	  	let ambLight = new THREE.AmbientLight(0xffffff);
	  	ambLight.position.set(5, 3, 5);
	  	scene.add(ambLight);

	  	handleWindowResize()

	  	animate()
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

	return (
		<div className="App">
			<ThreeSceneRenderer 
				className='h-100 w-100 position-absolute' 
				adaptToDeviceRatio 
				gammaCorrect
				onMount={extendScene}
			/>
		</div>
	);
}

export default App;
