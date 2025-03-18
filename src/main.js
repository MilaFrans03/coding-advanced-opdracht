import './style.css';
import './reset.css';
import { apiKey } from './secret.js';

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

// Een array met steden en hun coördinaten
const cities = [
  { name: "Kopenhagen", lat: 55.6761, lon: 12.5683, elementId: "kopenhagen-temp" },
  { name: "Cairo", lat: 30.0444, lon: 31.2357, elementId: "cairo-temp" },
  { name: "Rio de Janeiro", lat: -22.9068, lon: -43.1729, elementId: "riodejaneiro-temp" },
  { name: "Tokio", lat: 35.6895, lon: 139.6917, elementId: "tokio-temp" },
  { name: "Toronto", lat: 43.65107, lon: -79.347015, elementId: "toronto-temp" }
];

// Haalt het weer op en toont het in de juiste HTML-elementen
async function getWeather(city) {
  const url = `https://api.openweathermap.org/data/2.5/weather?lat=${city.lat}&lon=${city.lon}&appid=${apiKey}&units=metric`;

  try {
      const response = await fetch(url);
      const json = await response.json();

      if (json.main && json.main.temp) {
          document.getElementById(city.elementId).textContent = json.main.temp + "°C";
      } else {
          document.getElementById(city.elementId).textContent = "Geen data";
      }
  } catch (error) {
      console.error(`Fout bij ophalen van weergegevens voor ${city.name}:`, error);
      document.getElementById(city.elementId).textContent = "Kan niet laden";
  }
}


// Gebruik forEach om door alle steden te lopen en hun weer op te halen
cities.forEach((city) => {
  getWeather(city);
});