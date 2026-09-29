import {validateTool, LIMITS} from "./builder.mjs";
export class SceneEngine {
  constructor(container) {
    this.objects = [];
    this.lights = [];
    this.spinning = false;
    this.wireframeMode = false;

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x080c14);
    this.scene.fog = new THREE.FogExp2(0x080c14, 0.015);

    this.camera = new THREE.PerspectiveCamera(60, container.clientWidth / container.clientHeight, 0.1, 1000);
    this.camera.position.set(5, 4, 8);

    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setSize(container.clientWidth, container.clientHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(this.renderer.domElement);

    this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;

    // Lighting
    const ambient = new THREE.AmbientLight(0x404060, 0.5);
    this.scene.add(ambient);
    const dir = new THREE.DirectionalLight(0xffffff, 1);
    dir.position.set(5, 10, 7);
    this.scene.add(dir);
    const point = new THREE.PointLight(0x5ad1c4, 0.8, 20);
    point.position.set(-3, 5, -3);
    this.scene.add(point);

    // Grid
    const grid = new THREE.GridHelper(20, 20, 0x1f2a3a, 0x1f2a3a);
    this.scene.add(grid);

    // Resize
    window.addEventListener('resize', () => {
      this.camera.aspect = container.clientWidth / container.clientHeight;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(container.clientWidth, container.clientHeight);
    });

    this.builder = new THREE.Group();
    const body=new THREE.Mesh(new THREE.BoxGeometry(.4,.6,.3),this.getMaterial('#5ad1c4'));
    body.position.y=.65;this.builder.add(body);
    const head=new THREE.Mesh(new THREE.SphereGeometry(.22,16,12),this.getMaterial('#a78bfa'));
    head.position.y=1.2;this.builder.add(head);this.builder.position.set(-2,0,2);this.scene.add(this.builder);
    this.builderTarget=this.builder.position.clone();
    new ResizeObserver(()=>{
      const w=Math.max(1,container.clientWidth),h=Math.max(1,container.clientHeight);
      this.camera.aspect=w/h;this.camera.updateProjectionMatrix();this.renderer.setSize(w,h);
    }).observe(container);
    this.clock = new THREE.Clock();
    this.frameCount = 0;
    this.lastFpsUpdate = 0;
    this.animate();
  }

  animate() {
    requestAnimationFrame(() => this.animate());
    const t = this.clock.getElapsedTime();

    if (this.spinning) {
      this.objects.forEach((obj, i) => {
        obj.rotation.y = t * (0.5 + i * 0.1);
        obj.rotation.x = Math.sin(t * 0.3 + i) * 0.2;
        obj.position.y = obj.userData.baseY + Math.sin(t * 0.8 + i * 0.7) * 0.3;
        obj.userData.light?.position.copy(obj.position);
      });
    }

    this.builder.position.lerp(this.builderTarget,.07);
    this.controls.update();
    this.renderer.render(this.scene, this.camera);

    this.frameCount++;
    if (t - this.lastFpsUpdate > 0.5) {
      document.getElementById('fpsCounter').textContent = `${Math.round(this.frameCount / (t - this.lastFpsUpdate))} fps`;
      this.frameCount = 0;
      this.lastFpsUpdate = t;
    }
    document.getElementById('sceneInfo').textContent = `objects: ${this.objects.length}`;
  }

  apply(command) {
    const {name,args}=validateTool(command.name,command.args);
    if(name.startsWith('add_')&&this.objects.length>=LIMITS.objects)throw Error('Scene object limit reached');
    const methods={add_box:'addBox',add_sphere:'addSphere',add_cylinder:'addCylinder',add_torus:'addTorus',add_cone:'addCone',add_particles:'addParticles',add_light:'addLight'};
    if(name==='reset_scene')return this.reset();
    if(name==='set_background')return this.setBackground(args.color);
    const result=this[methods[name]](args);
    this.objects.at(-1).userData.command={name,args:{...args}};
    this.builderTarget.set(args.x-1,0,args.z+1);
    return result;
  }
  commands() {return this.objects.map(o=>o.userData.command).filter(Boolean);}
  getMaterial(color, emissive) {
    if (this.wireframeMode) {
      return new THREE.MeshBasicMaterial({ color, wireframe: true });
    }
    return new THREE.MeshStandardMaterial({
      color,
      emissive: emissive || color,
      emissiveIntensity: 0.15,
      metalness: 0.3,
      roughness: 0.4
    });
  }

  addBox(opts = {}) {
    const w = opts.width ?? 1, h = opts.height ?? 1, d = opts.depth ?? 1;
    const color = opts.color ?? this.randomColor();
    const geo = new THREE.BoxGeometry(w, h, d);
    const mat = this.getMaterial(color);
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(opts.x ?? 0, opts.y ?? 1, opts.z ?? 0);
    mesh.userData.baseY = mesh.position.y;
    this.scene.add(mesh);
    this.objects.push(mesh);
    return `box added at (${mesh.position.x}, ${mesh.position.y}, ${mesh.position.z}) color=${color}`;
  }

  addSphere(opts = {}) {
    const r = opts.radius ?? 0.7;
    const color = opts.color ?? this.randomColor();
    const geo = new THREE.SphereGeometry(r, 32, 32);
    const mat = this.getMaterial(color);
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(opts.x ?? 0, opts.y ?? 1.5, opts.z ?? 0);
    mesh.userData.baseY = mesh.position.y;
    this.scene.add(mesh);
    this.objects.push(mesh);
    return `sphere added radius=${r} at (${mesh.position.x}, ${mesh.position.y}, ${mesh.position.z}) color=${color}`;
  }

  addCylinder(opts = {}) {
    const r = opts.radius ?? 0.5, h = opts.height ?? 2;
    const color = opts.color ?? this.randomColor();
    const geo = new THREE.CylinderGeometry(r, r, h, 32);
    const mat = this.getMaterial(color);
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(opts.x ?? 0, opts.y ?? 1, opts.z ?? 0);
    mesh.userData.baseY = mesh.position.y;
    this.scene.add(mesh);
    this.objects.push(mesh);
    return `cylinder added radius=${r} height=${h} color=${color}`;
  }

  addTorus(opts = {}) {
    const r = opts.radius ?? 1, tube = opts.tube ?? 0.3;
    const color = opts.color ?? this.randomColor();
    const geo = new THREE.TorusGeometry(r, tube, 16, 48);
    const mat = this.getMaterial(color);
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(opts.x ?? 0, opts.y ?? 2, opts.z ?? 0);
    mesh.userData.baseY = mesh.position.y;
    this.scene.add(mesh);
    this.objects.push(mesh);
    return `torus added radius=${r} tube=${tube} color=${color}`;
  }

  addCone(opts = {}) {
    const r = opts.radius ?? 0.6, h = opts.height ?? 1.5;
    const color = opts.color ?? this.randomColor();
    const geo = new THREE.ConeGeometry(r, h, 32);
    const mat = this.getMaterial(color);
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(opts.x ?? 0, opts.y ?? 1, opts.z ?? 0);
    mesh.userData.baseY = mesh.position.y;
    this.scene.add(mesh);
    this.objects.push(mesh);
    return `cone added radius=${r} height=${h} color=${color}`;
  }

  addParticles(opts = {}) {
    const count = opts.count ?? 200;
    const spread = opts.spread ?? 8;
    const color = opts.color ?? '#5ad1c4';
    const geo = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count * 3; i++) positions[i] = (Math.random() - 0.5) * spread;
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const mat = new THREE.PointsMaterial({ color, size: 0.05, transparent: true, opacity: 0.8 });
    const points = new THREE.Points(geo, mat);
    points.position.set(opts.x ?? 0,opts.y ?? 0,opts.z ?? 0);
    points.userData.baseY = points.position.y;
    this.scene.add(points);
    this.objects.push(points);
    return `particle system added: ${count} particles, spread=${spread}`;
  }

  addLight(opts = {}) {
    const color = opts.color ?? '#ffffff';
    const intensity = opts.intensity ?? 1;
    const light = new THREE.PointLight(color, intensity, opts.distance ?? 15);
    light.position.set(opts.x ?? 0, opts.y ?? 4, opts.z ?? 0);
    if(this.lights.length>=LIMITS.lights)throw Error("Light limit reached");
    this.scene.add(light);
    this.lights.push(light);
    // Visible helper
    const helper = new THREE.Mesh(
      new THREE.SphereGeometry(0.1, 8, 8),
      new THREE.MeshBasicMaterial({ color })
    );
    helper.position.copy(light.position);
    helper.userData.baseY = helper.position.y;
    helper.userData.light = light;
    this.scene.add(helper);
    this.objects.push(helper);
    return `point light added at (${light.position.x}, ${light.position.y}, ${light.position.z}) intensity=${intensity}`;
  }

  setBackground(color) {
    this.scene.background = new THREE.Color(color);
    this.scene.fog.color.set(color);
    return `background set to ${color}`;
  }

  reset() {
    this.objects.forEach(obj => {
      this.scene.remove(obj);obj.geometry?.dispose();
      for(const mat of (Array.isArray(obj.material)?obj.material:[obj.material]))mat?.dispose();
    });
    this.lights.forEach(light=>{this.scene.remove(light);light.dispose?.();});
    this.lights=[];this.objects = [];
    return 'scene cleared';
  }

  toggleSpin() { this.spinning = !this.spinning; return `spin: ${this.spinning}`; }

  toggleWireframe() {
    this.wireframeMode = !this.wireframeMode;
    this.objects.forEach(obj => {
      if (obj.material) obj.material.wireframe = this.wireframeMode;
    });
    return `wireframe: ${this.wireframeMode}`;
  }

  explode() {
    this.objects.forEach((obj, i) => {
      const angle = (i / this.objects.length) * Math.PI * 2;
      const dist = 3 + Math.random() * 3;
      obj.position.x = Math.cos(angle) * dist;
      obj.position.z = Math.sin(angle) * dist;
      obj.userData.baseY = obj.position.y;
      obj.userData.light?.position.copy(obj.position);
      if(obj.userData.command)Object.assign(obj.userData.command.args,{x:obj.position.x,y:obj.position.y,z:obj.position.z});
    });
    return `exploded ${this.objects.length} objects outward`;
  }

  screenshot() {
    this.renderer.render(this.scene, this.camera);
    const url = this.renderer.domElement.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = url; a.download = 'twin-o-matic-scene.png'; a.click();
    return 'screenshot saved';
  }

  randomColor() {
    const colors = ['#5ad1c4', '#a78bfa', '#f59e0b', '#ef4444', '#10b981', '#ec4899', '#06b6d4', '#f97316'];
    return colors[Math.floor(Math.random() * colors.length)];
  }
}

