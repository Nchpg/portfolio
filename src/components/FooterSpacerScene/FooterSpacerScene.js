import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import './FooterSpacerScene.css';

const FooterSpacerScene = () => {
    const wrapperRef = useRef(null);
    const canvasRef = useRef(null);

    useEffect(() => {
        const wrapper = wrapperRef.current;
        const canvas = canvasRef.current;

        if (!wrapper || !canvas) return;

        const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        // 1. Initialisation du Rendu
        const renderer = new THREE.WebGLRenderer({
            canvas,
            alpha: true,
            antialias: true,
            powerPreference: 'high-performance',
        });
        renderer.setClearColor(0x000000, 0);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

        // 2. Scène et Caméra
        const scene = new THREE.Scene();
        // Caméra surélevée pour bien voir la profondeur de la grille
        const camera = new THREE.PerspectiveCamera(45, wrapper.clientWidth / wrapper.clientHeight, 1, 500);
        camera.position.set(0, 12, 35); 

        // 3. Création de la grille de points (beaucoup plus large)
        const AMOUNTX = 220; 
        const AMOUNTZ = 100;
        const SEPARATION = 1.0; 
        
        const numParticles = AMOUNTX * AMOUNTZ;
        const positions = new Float32Array(numParticles * 3);
        const scales = new Float32Array(numParticles);

        let i = 0, j = 0;
        for (let ix = 0; ix < AMOUNTX; ix++) {
            for (let iz = 0; iz < AMOUNTZ; iz++) {
                positions[i] = ix * SEPARATION - ((AMOUNTX * SEPARATION) / 2); // X
                positions[i + 1] = 0; // Y
                positions[i + 2] = iz * SEPARATION - ((AMOUNTZ * SEPARATION) / 2); // Z
                scales[j] = 1;
                i += 3;
                j++;
            }
        }

        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('scale', new THREE.BufferAttribute(scales, 1));

        // 4. ShaderMaterial (C'est ici que la magie WebGL opère)
        const material = new THREE.ShaderMaterial({
            uniforms: {
                uTime: { value: 0 },
                uMouse: { value: new THREE.Vector2(-100, -100) }
            },
            vertexShader: `
                uniform float uTime;
                uniform vec2 uMouse;
                attribute float scale;
                varying vec3 vColor;

                // Simplex 2D noise implementation
                vec3 permute(vec3 x) { return mod(((x*34.0)+1.0)*x, 289.0); }
                float snoise(vec2 v){
                    const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
                    vec2 i  = floor(v + dot(v, C.yy) );
                    vec2 x0 = v -   i + dot(i, C.xx);
                    vec2 i1;
                    i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
                    vec4 x12 = x0.xyxy + C.xxzz;
                    x12.xy -= i1;
                    i = mod(i, 289.0);
                    vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 )) + i.x + vec3(0.0, i1.x, 1.0 ));
                    vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
                    m = m*m ; m = m*m ;
                    vec3 x = 2.0 * fract(p * C.www) - 1.0;
                    vec3 h = abs(x) - 0.5;
                    vec3 ox = floor(x + 0.5);
                    vec3 a0 = x - ox;
                    m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );
                    vec3 g;
                    g.x  = a0.x  * x0.x  + h.x  * x0.y;
                    g.yz = a0.yz * x12.xz + h.yz * x12.yw;
                    return 130.0 * dot(m, g);
                }
                
                void main() {
                    vec3 p = position;
                    
                    // 1. Calcul du bruit de base
                    float n = snoise(p.xz * 0.03 + uTime * 0.08);
                    p.y = n * 2.0;
                    
                    // 2. Projection pour obtenir les coordonnées d'écran (clip space)
                    vec4 mvp = modelViewMatrix * vec4(p, 1.0);
                    vec4 projected = projectionMatrix * mvp;
                    vec2 screenPos = projected.xy / projected.w;
                    
                    // Facteur h pour la taille/couleur
                    float h = (p.y + 2.0) / 4.0;
                    
                    // 3. Attraction souris (en 2D écran)
                    float dist = distance(screenPos, uMouse);
                    float radius = 0.35; // Rayon d'action
                    if (dist < radius) {
                        float force = pow(1.0 - dist / radius, 2.0);
                        
                        // Normalisation de la force par rapport à la profondeur (mvp.z)
                        // Les points plus loin sont multipliés pour compenser l'effet de perspective
                        float depthFactor = 1.0 + abs(mvp.z) * 0.02;
                        
                        // Calcul du vecteur de direction du point vers la souris
                        vec2 dir = normalize(uMouse - screenPos);
                        
                        // Application de l'attraction avec compensation de profondeur
                        p.x += dir.x * force * 4.0 * depthFactor;
                        p.z += dir.y * force * 4.0 * depthFactor; 
                    }
                    
                    // Calcul couleur et taille standard
                    vColor = mix(vec3(0.45), vec3(1.0), smoothstep(0.0, 1.0, h));
                    
                    // 4. Projection finale
                    vec4 finalMv = modelViewMatrix * vec4(p, 1.0);
                    gl_Position = projectionMatrix * finalMv;
                    
                    // 5. Calcul de la taille finale (fixe)
                    gl_PointSize = scale * (2.0 + h * 2.0) * (45.0 / -finalMv.z);
                }
            `,
            fragmentShader: `
                varying vec3 vColor;
                void main() {
                    // Calcul pour transformer le carré du point WebGL en un cercle lisse
                    vec2 coord = gl_PointCoord - vec2(0.5);
                    float dist = length(coord);
                    
                    if (dist > 0.5) discard;
                    
                    // Contour lissé (anti-aliasing)
                    float alpha = smoothstep(0.5, 0.35, dist);
                    gl_FragColor = vec4(vColor, alpha * 0.85);
                }
            `,
            transparent: true,
            depthWrite: false,
            blending: THREE.AdditiveBlending // Effet légèrement lumineux quand ils se chevauchent
        });

        const particles = new THREE.Points(geometry, material);
        scene.add(particles);

        // 5. Interaction Souris
        const mouse = new THREE.Vector2(-100, -100);
        const raycaster = new THREE.Raycaster();
        const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
        const mousePos = new THREE.Vector3();

        const handleMouseMove = (event) => {
            const rect = wrapper.getBoundingClientRect();
            mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
            mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
            material.uniforms.uMouse.value.set(mouse.x, mouse.y);
        };
        wrapper.addEventListener('mousemove', handleMouseMove);
        
        wrapper.addEventListener('mouseleave', () => {
            material.uniforms.uMouse.value.set(-10, -10);
        });

        // 6. Gestion du redimensionnement
        const resize = () => {
            const { width, height } = wrapper.getBoundingClientRect();
            renderer.setSize(width, height, false);
            camera.aspect = width / Math.max(height, 1);
            camera.updateProjectionMatrix();
        };
        const resizeObserver = new ResizeObserver(resize);
        resizeObserver.observe(wrapper);
        resize();

        // 7. Boucle d'animation
        let frameId;
        const startedAt = performance.now();

        const render = () => {
            const elapsed = (performance.now() - startedAt) / 1000;
            
            // Mise à jour du temps pour animer la vague dans le Shader
            material.uniforms.uTime.value = elapsed;

            // Caméra fixe avec un angle plus prononcé
            camera.position.set(0, 20, 50);
            camera.lookAt(0, 0, 0);

            renderer.render(scene, camera);

            if (!reducedMotion) {
                frameId = requestAnimationFrame(render);
            }
        };

        render();

        return () => {
            cancelAnimationFrame(frameId);
            resizeObserver.disconnect();
            wrapper.removeEventListener('mousemove', handleMouseMove);
            geometry.dispose();
            material.dispose();
            renderer.dispose();
        };
    }, []);

    return (
        <div className="footer-spacer-scene" ref={wrapperRef} aria-hidden="true">
            <canvas
                ref={canvasRef}
                className="footer-spacer-scene__canvas"
                data-engine="three.js"
            />
            <div className="footer-spacer-scene__veil" />
        </div>
    );
};

export default FooterSpacerScene;
