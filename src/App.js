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

  	var materials = [], parameters

  	function extendScene(props){

		({canvas, renderer} = props)

		scene = new THREE.Scene()

	  	camera = new THREE.PerspectiveCamera(FOV, ASPECT, NEAR, FAR);

	  	controls = new OrbitControls(camera, renderer.domElement);

		clock = new THREE.Clock()

	  	//scene.background = new THREE.Color('red');

	  	var avatar = new THREE.Object3D()

	  	scene.add(avatar)

	  	let loader = new GLTFLoader()

	  	loader.load('assets/coach-animated.glb', (gltf)=>{

	  		gltf.scene.traverse((mesh)=>{

				if(mesh.isSkinnedMesh) {
					const helper = new THREE.BoxHelper(mesh);
					helper.visible = false
					avatar.add(helper)
				}
	  		})

			mixer = new THREE.AnimationMixer( gltf.scene );

	 		var action = mixer.clipAction( gltf.animations[ 1 ] );

	  		action.play();

			scene.add(gltf.scene)

			setContent(gltf.scene, camera, controls)
			controls.autoRotate = true
			camera.position.x = camera.position.x + 5
			camera.position.y = camera.position.y + 5
	  	})

	  	let spotLight = new THREE.SpotLight(0xffffff, 1)
	  	spotLight.position.set(45, 50, 15);
	  	scene.add(spotLight);

	  	let ambLight = new THREE.AmbientLight(0xffffff, 0.5);
	  	ambLight.position.set(5, 3, 5);
	  	scene.add(ambLight);

	  	var geometry = new THREE.BufferGeometry();
		var vertices = [];

		var textureLoader = new THREE.TextureLoader();

		var sprite1 = textureLoader.load( 'assets/dollar.png' );

		for ( var i = 0; i < 100; i ++ ) {

			var x = Math.random() * 20 - 10;
			var y = Math.random() * 20 - 10;
			var z = Math.random() * 20 - 10;

			vertices.push( x, y, z );

		}

		geometry.setAttribute( 'position', new THREE.Float32BufferAttribute( vertices, 3 ) );

		parameters = [
			[[ 1.0, 0.2, 0.5 ], sprite1, 1 ],
		];

		for ( var i = 0; i < parameters.length; i ++ ) {

			var color = parameters[ i ][ 0 ];
			var sprite = parameters[ i ][ 1 ];
			var size = parameters[ i ][ 2 ];

			materials[ i ] = new THREE.PointsMaterial( { size: size, map: sprite, blending: THREE.AdditiveBlending, transparent: true } );
			materials[ i ].color.setHSL( color[ 0 ], color[ 1 ], color[ 2 ] );

			var particles = new THREE.Points( geometry, materials[ i ] );

			particles.rotation.x = Math.random() * 6;
			particles.rotation.y = Math.random() * 6;
			particles.rotation.z = Math.random() * 6;

			//scene.add( particles );

		}

		window.addEventListener('resize', handleWindowResize)

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

  		var time = Date.now() * 0.00005;

		var delta = clock.getDelta();

		if(mixer){
	  		mixer.update(delta)
		}

    	controls.update();

		renderer.render(scene, camera)

		for ( var i = 0; i < scene.children.length; i ++ ) {

					var object = scene.children[ i ];

					if ( object instanceof THREE.Points ) {

						object.rotation.y = time * ( i < 4 ? i + 1 : - ( i + 1 ) );

					}

				}

		requestAnimationFrame(animate)
  	}

	return (
		<div className="App">
			<ThreeSceneRenderer 
				className='h-100 w-100 position-absolute bg-gradient' 
				adaptToDeviceRatio 
				gammaCorrect
				onMount={extendScene}
			/>
		</div>
	);
}

export default App;
