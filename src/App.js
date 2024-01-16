import {
	Color,
	DirectionalLight,
	DoubleSide,
	Mesh,
	OrthographicCamera,
	PlaneGeometry,
	SRGBColorSpace,
	Scene,
	ShaderMaterial,
	TextureLoader,
	Vector2,
	Vector4,
	WebGLRenderer,
} from "three";
import { OrbitControls } from "three/examples/jsm/Addons";
import { isTouchEnabledDevice } from "./helpers";
import fragmentShader from "./shaders/fragment.glsl";
import vertexShader from "./shaders/vertex.glsl";
import gsap from "gsap";

export default class App {
	constructor() {
		this.init();
	}

	init() {
		console.log("App initialised");
		this.isMobile = isTouchEnabledDevice();
		// viewport
		this.width = window.innerWidth;
		this.height = window.innerHeight;
		this.time = 0;
		this.mouse = {
			x: 0,
			y: 0,
			targetX: 0,
			targetY: 0,
		};
		this.bulge = 0;
		this.strength = 1.1;
		this.radius = 0.95;

		this.createMouseEventListeners();
		this.createComponents();
		this.resize();
		window.addEventListener("resize", () => this.resize());
		this.render();
	}

	onMouseMove = (e) => {
		const clientX = !this.isMobile ? e.clientX : e.touches[0].clientX;
		const clientY = !this.isMobile ? e.clientY : e.touches[0].clientY;

		this.mouse.x = clientX / this.width;
		this.mouse.y = clientY / this.height;
	};

	onMouseEnter = (e) => {
		console.log("entered");
		gsap.to(this.material.uniforms.uBulge, { value: 1, duration: 1, ease: "expo.out" });
	};

	onMouseLeave = (e) => {
		gsap.to(this.material.uniforms.uBulge, { value: 0, duration: 1, ease: "expo.out" });
	};

	createMouseEventListeners() {
		if (this.isMobile) {
			window.addEventListener("touchmove", this.onMouseMove);
			window.addEventListener("touchstart", this.onMouseEnter);
			window.addEventListener("touchend", this.onMouseLeave);
		} else {
			window.addEventListener("mousemove", this.onMouseMove);
			window.addEventListener("mouseover", this.onMouseEnter);
			window.addEventListener("mouseout", this.onMouseLeave);
		}
	}

	createComponents() {
		this.createRenderer();
		this.createCamera();
		// this.createControls();
		this.createScene();
		this.createObjects();
		// this.createGUI();
	}

	createRenderer() {
		// renderer
		this.renderer = new WebGLRenderer({ antialias: true, alpha: true });
		this.canvas = this.renderer.domElement;
		document.getElementById("app").appendChild(this.canvas);
		this.renderer.setClearColor(0x242424, 1);
		this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
		this.renderer.setSize(this.width, this.height);
		this.renderer.physicallyCorrectlights = true;
		this.renderer.outputColorSpace = SRGBColorSpace;
	}

	createCamera() {
		this.frustrumSize = 1;
		this.camera = new OrthographicCamera(
			this.frustrumSize / -2,
			this.frustrumSize / 2,
			this.frustrumSize / 2,
			this.frustrumSize / -2,
			-1000,
			1000
		);
		this.camera.position.set(0, 0, 2);
	}

	createControls() {
		// controls
		this.controls = new OrbitControls(this.camera, this.canvas);
		this.controls.enableDamping = true;
		this.controls.update();
	}

	createScene() {
		// scene
		this.scene = new Scene();
		this.scene.background = new Color(0x242424);
	}

	createLights() {
		// lights
		this.lights = [];
		this.lights[0] = new DirectionalLight(0xffffff, 5);
		this.lights[1] = new DirectionalLight(0xffffff, 5);
		this.lights[2] = new DirectionalLight(0xffffff, 5);
		this.lights[0].position.set(0, 20, 0);
		this.lights[1].position.set(10, 20, 10);
		this.lights[2].position.set(-10, -20, -10);

		this.scene.add(this.lights[0]);
		this.scene.add(this.lights[1]);
		this.scene.add(this.lights[2]);
	}

	createTexture() {
		new TextureLoader().load("/image.jpg", (texture) => {
			this.texture = texture;
			this.uniforms.uTexture.value = this.texture;
			this.uniforms.uTextureResolution.value.x = this.texture.image.width;
			this.uniforms.uTextureResolution.value.y = this.texture.image.height;
			this.material.needsUpdate = true;
		});
	}

	createObjects() {
		this.planeProps = {
			width: 1,
			height: 1,
			widthSegments: 1,
			heightSegments: 1,
		};
		this.createTexture();
		this.uniforms = {
			uTime: { value: 0 },
			uTexture: { value: null },
			uTextureResolution: { value: new Vector2() },
			uResolution: { value: new Vector2(this.canvas.offsetWidth, this.canvas.offsetHeight) },
			uMouse: { value: new Vector2(this.mouse.x, this.mouse.y) },
			uMouseIntro: { value: new Vector2(0.5, 0) },
			uIntro: { value: 0 },
			uBulge: { value: 0 },
			uRadius: { value: this.radius },
			uStrength: { value: this.strength },
		};
		this.geometry = new PlaneGeometry(
			this.planeProps.width,
			this.planeProps.height,
			this.planeProps.widthSegments,
			this.planeProps.heightSegments
		);
		this.material = new ShaderMaterial({
			side: DoubleSide,
			uniforms: { ...this.uniforms },
			vertexShader: vertexShader,
			fragmentShader: fragmentShader,
		});
		this.material.needsUpdate = true;
		this.plane = new Mesh(this.geometry, this.material);
		this.scene.add(this.plane);
	}

	// createGUI() {
	// 	this.gui = new GUI();

	// 	this.gui
	// 		.add(this.image, "image", this.imageUrls)
	// 		.listen()
	// 		.onChange(async (e) => {
	// 			this.material.uniforms.uTexture.value = new TextureLoader().load(this.image.image);
	// 			this.resizeImage();
	// 		});
	// }

	resize() {
		this.width = window.innerWidth;
		this.height = window.innerHeight;
		this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
		this.renderer.setSize(this.width, this.height);
		this.camera.updateProjectionMatrix();
		this.material.uniforms.uResolution.value.x = this.canvas.offsetWidth;
		this.material.uniforms.uResolution.value.y = this.canvas.offsetHeight;
		this.material.needsUpdate = true;
	}

	render() {
		requestAnimationFrame(() => this.render());
		this.time += 0.05;
		this.material.uniforms.uTime.value = this.time;
		this.mouse.targetX = gsap.utils.interpolate(this.mouse.targetX, this.mouse.x, 0.1);
		this.mouse.targetY = gsap.utils.interpolate(this.mouse.targetY, this.mouse.y, 0.1);
		this.material.uniforms.uMouse.value.x = this.mouse.targetX;
		this.material.uniforms.uMouse.value.y = this.mouse.targetY;
		this.renderer.render(this.scene, this.camera);
		// this.controls.update();
	}
}
