import './style.css';
import './reset.css';
import { apiKey } from './secret.js';
import * as THREE from 'three';

// core version + navigation, pagination modules:
import Swiper from 'swiper';
import { Navigation, Pagination } from 'swiper/modules';
// import Swiper and modules styles
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

// init Swiper:
const swiper = new Swiper('.swiper', {
  // configure Swiper to use modules
  modules: [Navigation, Pagination],
  // Optional parameters
  direction: 'horizontal',
  loop: true,

  // If we need pagination
  pagination: {
    el: '.swiper-pagination',
  },

  // Navigation arrows
  navigation: {
    nextEl: '.swiper-button-next',
    prevEl: '.swiper-button-prev',
  },
});

// HET WEER

const cities = [
  {
    name: 'Kopenhagen',
    lat: 55.6761,
    lon: 12.5683,
    elementId: 'kopenhagen-temp',
  },
  { name: 'Cairo', lat: 30.0444, lon: 31.2357, elementId: 'cairo-temp' },
  {
    name: 'Rio de Janeiro',
    lat: -22.9068,
    lon: -43.1729,
    elementId: 'riodejaneiro-temp',
  },
  { name: 'Tokio', lat: 35.6895, lon: 139.6917, elementId: 'tokio-temp' },
  {
    name: 'Toronto',
    lat: 43.65107,
    lon: -79.347015,
    elementId: 'toronto-temp',
  },
];

async function getWeather(city) {
  const url = `https://api.openweathermap.org/data/2.5/weather?lat=${city.lat}&lon=${city.lon}&appid=${apiKey}&units=metric`;

  try {
    const response = await fetch(url);
    const json = await response.json();

    if (json.main && json.main.temp) {
      document.getElementById(city.elementId).textContent = json.main.temp;
    } else {
      document.getElementById(city.elementId).textContent = 'Geen data';
    }
  } catch (error) {
    console.error(`Error fetching weather data for ${city.name}:`, error);
    document.getElementById(city.elementId).textContent = 'Kan niet laden';
  }
}

cities.forEach((city) => {
  getWeather(city);
});

// WebGL Renderer with transparency enabled
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000,
);

camera.position.set(0, 0.5, 3);
camera.lookAt(0, 0, 0);

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0x000000, 0); // Black with full transparency

// Dynamically add the canvas to each swiper slide for each city
cities.forEach((city) => {
  const slideElement = document.getElementById(city.elementId);
  if (slideElement) {
    // Empty the slide if it already has a canvas
    slideElement.innerHTML = '';
    slideElement.appendChild(renderer.domElement); // Append canvas to the slide
  }
});

// Globe Setup
const textureLoader = new THREE.TextureLoader();
const earthTexture = textureLoader.load('earth.jpg');

const geometry = new THREE.SphereGeometry(1, 64, 64);
const material = new THREE.MeshStandardMaterial({ map: earthTexture });
const globe = new THREE.Mesh(geometry, material);
scene.add(globe);

// Lighting
scene.add(new THREE.AmbientLight(0xffffff, 0.6));
const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
directionalLight.position.set(5, 3, 5);
scene.add(directionalLight);

function getCoordinatesFromLatLon(lat, lon, radius = 1.05) {
  const phi = THREE.MathUtils.degToRad(90 - lat);
  const theta = THREE.MathUtils.degToRad(lon + 180);
  const x = radius * Math.sin(phi) * Math.cos(theta);
  const y = radius * Math.cos(phi);
  const z = radius * Math.sin(phi) * Math.sin(theta);
  return { x, y, z };
}

function createRedMarker(lat, lon) {
  const { x, y, z } = getCoordinatesFromLatLon(lat, lon);
  const markerGeometry = new THREE.SphereGeometry(0.05, 32, 32);
  const markerMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
  const marker = new THREE.Mesh(markerGeometry, markerMaterial);
  marker.position.set(x, y, z);
  scene.add(marker);
  return marker;
}

// Animation loop
function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
}

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

animate();

let currentMarker = null; // to store and remove previous marker
swiper.on('slideChange', () => {
  const activeIndex = swiper.realIndex; // loop-safe index
  const activeCity = cities[activeIndex];

  if (activeCity) {
    if (currentMarker) {
      scene.remove(currentMarker);
      currentMarker = null;
    }
    currentMarker = createRedMarker(activeCity.lat, activeCity.lon);
  }

  const activeSlide = swiper.slides[swiper.activeIndex];
  if (activeSlide) {
    activeSlide.appendChild(renderer.domElement);
  }
});
