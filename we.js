// Pakistan aur Gilgit-Baltistan (G.B) ke saare ilaqon ka pre-defined data grid
const regionsData = {
    // Gilgit-Baltistan (G.B)
    "gilgit": { lat: 35.9208, lon: 74.3083, name: "Gilgit, G.B" },
    "hunza": { lat: 36.3167, lon: 74.6500, name: "Hunza, G.B" },
    "skardu": { lat: 35.2974, lon: 75.6329, name: "Skardu, G.B" },
    "astor": { lat: 35.3653, lon: 74.8600, name: "Astore, G.B" },
    "diamer": { lat: 35.4167, lon: 74.1000, name: "Chilas (Diamer), G.B" },
    "chilas": { lat: 35.4167, lon: 74.1000, name: "Chilas, G.B" },
    "ghizer": { lat: 36.1667, lon: 73.5833, name: "Gahkuch (Ghizer), G.B" },
    "gahkuch": { lat: 36.1667, lon: 73.5833, name: "Gahkuch, G.B" },
    "khaplu": { lat: 35.1611, lon: 76.3322, name: "Khaplu (Ghanche), G.B" },
    "ghanche": { lat: 35.1611, lon: 76.3322, name: "Ghanche, G.B" },
    "shigar": { lat: 35.4244, lon: 75.7256, name: "Shigar, G.B" },
    "nagar": { lat: 36.2125, lon: 74.3875, name: "Nagar, G.B" },
    
    // Pakistan Main Cities
    "karachi": { lat: 24.8607, lon: 67.0011, name: "Karachi" },
    "lahore": { lat: 31.5204, lon: 74.3587, name: "Lahore" },
    "islamabad": { lat: 33.6844, lon: 73.0479, name: "Islamabad" },
    "rawalpindi": { lat: 33.5651, lon: 73.0160, name: "Rawalpindi" },
    "faisalabad": { lat: 31.4504, lon: 73.1350, name: "Faisalabad" },
    "multan": { lat: 30.1575, lon: 71.5249, name: "Multan" },
    "peshawar": { lat: 34.0151, lon: 71.5249, name: "Peshawar" },
    "quetta": { lat: 30.1798, lon: 66.9750, name: "Quetta" },
    "gwadar": { lat: 25.1216, lon: 62.3254, name: "Gwadar" }
};

// Pehle se weather card ko chupanay ke liye UI ko set karna
document.getElementById('weather-info').style.display = 'none';

document.getElementById('search-btn').addEventListener('click', () => {
    const city = document.getElementById('city-input').value.trim();
    if (city) handleSearch(city);
});

document.getElementById('city-input').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        const city = e.target.value.trim();
        if (city) handleSearch(city);
    }
});

function getWeatherDescription(code) {
    const codes = {
        0: "Clear Sky", 1: "Mainly Clear", 2: "Partly Cloudy", 3: "Overcast",
        45: "Foggy", 48: "Depositing Rime Fog", 51: "Light Drizzle",
        53: "Moderate Drizzle", 55: "Dense Drizzle", 61: "Slight Rain",
        63: "Moderate Rain", 65: "Heavy Rain", 71: "Slight Snow",
        73: "Moderate Snow", 75: "Heavy Snow", 95: "Thunderstorm"
    };
    return codes[code] || "Variable Conditions";
}

async function handleSearch(cityName) {
    const infoDiv = document.getElementById('weather-info');
    const errorDiv = document.getElementById('error-msg');
    const searchKey = cityName.toLowerCase();
    
    // 1. Check list data
    if (regionsData[searchKey]) {
        const target = regionsData[searchKey];
        await fetchLiveWeather(target.lat, target.lon, target.name, "PK");
        infoDiv.style.display = 'block';
        errorDiv.style.display = 'none';
        return;
    }

    // 2. Global API Search (Galti yahan [0] na lagane ki wajah se thi)
    try {
        const geoUrl = `https://open-meteo.com{encodeURIComponent(cityName)}&count=1&language=en&format=json`;
        const geoResponse = await fetch(geoUrl);
        const geoData = await geoResponse.json();

        if (!geoData.results || geoData.results.length === 0) {
            throw new Error("Location not found");
        }

        // FIX: Array ka pehla element ([0]) select kiya hai ab
        const location = geoData.results[0];
        await fetchLiveWeather(location.latitude, location.longitude, location.name, location.country_code);
        
        infoDiv.style.display = 'block';
        errorDiv.style.display = 'none';
    } catch (err) {
        infoDiv.style.display = 'none';
        errorDiv.style.display = 'block';
    }
}

async function fetchLiveWeather(lat, lon, displayName, countryCode) {
    const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m`;
    
    const response = await fetch(weatherUrl);
    const data = await response.json();
    const current = data.current;

    document.getElementById('city-name').textContent = displayName;
    document.getElementById('weather-desc').textContent = getWeatherDescription(current.weather_code);
    document.getElementById('temperature').textContent = `${Math.round(current.temperature_2m)}°C`;
    document.getElementById('humidity').textContent = `${current.relative_humidity_2m}%`;
    document.getElementById('wind-speed').textContent = `${current.wind_speed_10m} km/h`;
}
