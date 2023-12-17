//THREE JS 
import * as THREE from '../threejs/build/three.module.js'
import {OrbitControls} from '../threejs/examples/jsm/controls/OrbitControls.js';





//--------------------------------------------

//VARIABLES
const wSc = 1200, hSc = 1000; //Dimensions de la scene 
let scene, camera, renderer;
let ctr, clouds;
let meshEarth;
let json;
let marker = [];
let controls;
let domEvents;


// Chargement des données JSON
function loadJSON(){
    fetch("./assets/json/ba.json")
        .then(response => {return response.json()})
        .then(jsonData =>{
        console.log(jsonData);
        //console.log(jsonData.unesco[0].legend_fr);

        // Stocke les donnés
        json = jsonData;

        // Création des éléments
        createScene();
        createlight();
        createEarth();
        createClouds();
        createAtmosphere();
        createMarker();
        renderScene();
        updateControls();
        })
}

loadJSON();


//Création de la scene 
function createScene(){
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x276a9f);
    //------------------------------------------------
    camera = new THREE.PerspectiveCamera(35, wSc / hSc, 0.1, 50);
    camera.position.z = 4;
    camera.lookAt(0, 0, 0);
    //------------------------------------------------
    renderer = new THREE.WebGLRenderer({antialias:true});
    renderer.setSize(wSc, hSc);
    $(renderer.domElement) 
        .addClass('canvas-three')
        .appendTo('#ctrEarth');
    //------------------------------------------------

    controls = new OrbitControls(camera, renderer.domElement);
    // Set the target of the controls to the center of the globe
    controls.target.set(0, 0, 0);

    // Enable zooming with the mouse scroll wheel
    controls.enableZoom = true;



}

//Création des lights
function createlight(){
    const aL = new THREE.AmbientLight(0xEEF1FF, 0.7);
    scene.add(aL);

    const dL = new THREE.DirectionalLight(0xFFFFEE, 1.4);
    scene.add(dL);
    const targetDL = new THREE.Object3D();
    targetDL.position.set(5, -5, -5);
    scene.add(targetDL);
    dL.target = targetDL;
}

//Creation du globe terrestre 
function createEarth(){
    //conteneur pour centraliser tout les elements 3D 
    ctr = new THREE.Object3D()
    scene.add(ctr);

    //Creation de la geometrie
    const geom = new THREE.SphereGeometry(1.0, 24, 24);

    //Creation du materiau 
    const matEarth = new THREE.MeshStandardMaterial({color:0x8888888});
    matEarth.map = new THREE.TextureLoader().load('./assets/textures/earth-medium.jpg');
    //matEarth.displacementMap = new THREE.TextureLoader().load('./assets/textures/bump-medium.jpg');
    //matEarth.displacementScale = 0.07;
    matEarth.bumpMap = new THREE.TextureLoader().load('./assets/textures/bump-medium.jpg')
    matEarth.bumpScale = 0.025;
    //creation du noeud 
    meshEarth = new THREE.Mesh(geom, matEarth);
    meshEarth.name = "earth";
    ctr.add(meshEarth);
}

function createClouds(){
    clouds = new THREE.Mesh(
        new THREE.SphereGeometry(1.02, 32, 32),
        new THREE.MeshStandardMaterial({
            map : new THREE.TextureLoader().load('./assets/textures/clouds-med.jpg'),
            alphaMap : new THREE.TextureLoader().load('./assets/textures/clouds-med.jpg'),
            transparent:true,
            opacity : 0.7,
        })
    )
    clouds.name = "clouds";
    meshEarth.add(clouds);

}
function createAtmosphere(){
    const atmo = new THREE.Mesh(
        new THREE.SphereGeometry(1.5, 72, 72),
        new THREE.ShaderMaterial({
            vertexShader: `
                varying vec3 vertexNormal;

                void main(){
                    vertexNormal = normalize(normalMatrix * normal);
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                }
                `,
                fragmentShader: `
                varying vec3 vertexNormal;

                void main(){
                    float intensity = pow(0.3 - dot(vertexNormal, vec3(0.0, 0.0, 1.0)), 2.0);
                    gl_FragColor = vec4(0.3, 0.84, 1.0, 1.0) * intensity;
                }
                `,
                blending: THREE.AdditiveBlending,
                side: THREE.BackSide
        })
    )
    atmo.position.set(0.03, 0.03, 0);
    ctr.add(atmo);}




/** Fonction pour dÃ©terminer les coordonÃ©es d'un point 3D Ã  partir d'un coordonnÃ©e (latitude, longitude) */
function pointFromLatLon(lat, lon, radius){
    var phi = (90 - lat) * (Math.PI / 180);
    var theta = (lon + 180) * (Math.PI / 180);
    return new THREE.Vector3(
        -(radius * Math.sin(phi) * Math.cos(theta)),
        (radius * Math.cos(phi)),
        (radius * Math.sin(phi) * Math.sin(theta))
    )
}

// Création de markers par rapport aux données JSON
function createMarker(){
    // Boucle sur les données JSON
    for(let i = 0; i < json.unesco.length; i++){
        // Création du marker
        marker = new THREE.Mesh(
            new THREE.SphereGeometry(0.02, 8, 8),
            new THREE.MeshStandardMaterial({color:0xFF0000})
        )
        // Positionne le marker
        marker.position.copy(pointFromLatLon(json.unesco[i].latitude, json.unesco[i].longitude, 1.01));
         
        // Ajoute le marker à la scène
        ctr.add(marker);
    }   
}



// Affiche les informations du marker


function getMarkerPosition(lat, lng, earthRotation) {
    // Convertit les coordonnées du marqueur en radians
    const latRad = lat * (Math.PI / 180);
    const lngRad = lng * (Math.PI / 180);
  
    // Calcule la position x, y, z du marqueur en utilisant les coordonnées et la rotation de la terre
    const x = Math.cos(latRad) * Math.cos(lngRad + earthRotation);
    const y = Math.sin(latRad);
    const z = Math.cos(latRad) * Math.sin(lngRad + earthRotation);
  
    // Retourne la position calculée
    return new THREE.Vector3(x, y, z);
}  


// Update the controls on every frame
function updateControls(){
    controls.update();
}






//loop rendu scene 
function renderScene(){
    requestAnimationFrame(renderScene);

    //Actualise le renderer 
    renderer.render(scene, camera);

    // Pivote les nuages
    if(clouds) clouds.rotation.y += 0.0002;
    

    // Pivote la terre
    if(meshEarth) ctr.rotation.y += 0.0001 ;
    
     // Update the controls on every frame
     updateControls();

    

         
}
