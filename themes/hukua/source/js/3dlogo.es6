'use strict';

// 旋转速度
const rotateSpeed = 50 / 60 * Math.PI / 180;

// 基本要素
let scene = null;
let camera = null;
let renderer = null;

// 苹果本体
let appleMesh = null;
let appleMtl = null;
// 茎
let stemMesh = null;
let stemMtl = null;
// 整体
let groupMesh = null;
let centerPivot = null;

// 光源
let keyLight = null;

// shader
let vs;
let fs;


function isPC() {
  const userAgentInfo = navigator.userAgent;
  const Agents = new Array("Android", "iPhone", "SymbianOS", "Windows Phone", "iPad", "iPod");
  let flag = true;
  for (var v = 0; v < Agents.length; v++) {
    if (userAgentInfo.indexOf(Agents[v]) > 0) { flag = false; break; }
  }
  return flag;
}

function init() {
  const canvas = document.getElementById('mainCanvas');

  renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true, // 抗锯齿
  })
  renderer.setClearColor(0x120D19);

  scene = new THREE.Scene();

  // 相机
  camera = new THREE.PerspectiveCamera(60, canvas.width / canvas.height, 10, 10000);
  camera.position.set(0, 0, 150);
  camera.target = new THREE.Vector3(0, 0, 0);
  scene.add(camera);

  // 聚光灯光源
  keyLight = new THREE.SpotLight(0xffffff, 1, 5000, Math.PI / 6, 25);
  keyLight.position.set(100, 50, 350);
  keyLight.target.position.set(0, 0, 0);
  scene.add(keyLight);

  // 加载模型
  const objLoader = new THREE.OBJLoader();
  objLoader.load('http://hukua-blog.oss-cn-beijing.aliyuncs.com/assets/apple.obj', (obj) => {
    // 加载shader
    Promise.all([
      fetch('http://hukua-blog.oss-cn-beijing.aliyuncs.com/assets/cartoon.vs', {
        mode: 'cors',
      })
      .then(value => value.text()),
      fetch('http://hukua-blog.oss-cn-beijing.aliyuncs.com/assets/cartoon.fs', {
        mode: 'cors',
      })
      .then(value => value.text())
    ])
    .then(values => {
      vs = values[0];
      fs = values[1];
    })

    obj.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        if (!appleMesh) {
          appleMesh = child;
          appleMtl = appleMesh.material;
        } else {
          stemMesh = child;
          stemMtl = stemMesh.material;
        }
      }
    });

    groupMesh = obj;
    groupMesh.position.set(-60, -30, 0);
    // 与中心点绑定
    centerPivot = new THREE.Object3D();
    centerPivot.add(groupMesh);
    centerPivot.rotateX(30 * Math.PI / 180);

    useShader();
    scene.add(centerPivot);
    // 开始动画
    tick();
  });
}

function update() {
  useShader();
  // 旋转跳跃
  centerPivot.rotateY(rotateSpeed);
}

// 每帧绘制
function tick() {
  update();
  draw();
  requestAnimationFrame(tick);
}

function draw() {
  renderer.render(scene, camera);
}

// 使用着色器
function useShader() {
  const lightUniform = {
    type: 'v3',
    // 这里是世界坐标系下的位置
    value: keyLight.position
  }

  setShader(appleMesh, {
    uniforms: {
      color: {
        type: 'v3',
        value: new THREE.Color('#ff0a85')
      },
      light: lightUniform,
    }
  });
  setShader(stemMesh, {
    uniforms: {
      color: {
        type: 'v3',
        value: new THREE.Color('#09fffa')
      },
      light: lightUniform,
    }
  });

  function setShader(mesh, qualifiers) {
    // 自定义shader!!!!
    const material = new THREE.ShaderMaterial({
      vertexShader: vs,
      fragmentShader: fs,
      uniforms: qualifiers.uniforms,
    });
    mesh.material = material;
  }
}

if (isPC()) {
  init();
}