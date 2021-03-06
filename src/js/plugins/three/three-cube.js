import * as THREE from 'three';

const createCube = scene => {
  const geometry = new THREE.BoxGeometry(0.2, 0.2, 0.2);
  const material = new THREE.MeshNormalMaterial();

  const mesh = new THREE.Mesh(geometry, material);
  mesh.name = 'cube';
  scene.add(mesh);

  const animation = () => {
    // mesh.rotation.x = -window.face.translationY*0.5;
    // mesh.rotation.y = -window.face.translationX*0.5;
  };
  scene.animationQueue.push(animation);
};

export default createCube;
