import axios from "axios";

// Get time of day period
export const getTimePeriod = () => {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return "Morning";
  if (hour >= 12 && hour < 18) return "Afternoon";
  if (hour >= 18 && hour < 24) return "Evening";
  return "Dawn";
};

// Get weather icon based on condition
export const getWeatherIcon = (iconName) => {
  const icons = {
    sunny: require('../image/sunnyday.png'),
    rainy: require('../image/rainy.png'),
    cloudy: require('../image/cloudy.png'),
    windy: require('../image/windy.png'),
  };
  return icons[iconName] || icons.sunny;
};

// Determine weather condition text and icon
export const determineWeatherCondition = (weatherData) => {
  const timePeriod = getTimePeriod();
  const weatherMain = weatherData.weather[0].main.toLowerCase();
  const weatherDesc = weatherData.weather[0].description.toLowerCase();
  const windSpeed = weatherData.wind.speed;
  const isWindy = windSpeed > 5; // Consider windy if > 5 m/s

  let condition = "";
  let iconName = "sunny";

  // Check for storm first
  if (weatherMain === "thunderstorm" || weatherDesc.includes("storm")) {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 18) {
      condition = "Stormy Day";
    } else if (hour >= 18 && hour < 24) {
      condition = "Stormy Evening";
    } else {
      condition = "Stormy Dawn";
    }
    iconName = "rainy";
    return { condition, icon: getWeatherIcon(iconName) };
  }

  // Rain
  if (weatherMain === "rain" || weatherMain === "drizzle") {
    condition = `Rainy ${timePeriod}`;
    iconName = "rainy";
  }
  // Cloudy
  else if (weatherMain === "clouds") {
    condition = `Cloudy ${timePeriod}`;
    iconName = "cloudy";
  }
  // Clear
  else if (weatherMain === "clear") {
    const hour = new Date().getHours();
    if (hour >= 18 && hour < 24) {
      condition = "Clear Night";
    } else if (hour >= 0 && hour < 5) {
      condition = "Clear Dawn";
    } else {
      condition = `Sunny ${timePeriod}`;
    }
    iconName = "sunny";
  }
  // Default sunny
  else {
    condition = `Sunny ${timePeriod}`;
    iconName = "sunny";
  }

  // Add windy suffix if conditions are windy but not rainy/stormy
  if (isWindy && !weatherMain.includes("rain") && !weatherMain.includes("thunderstorm")) {
    const hour = new Date().getHours();
    // For clear night/dawn, keep the icon as is
    if ((hour >= 18 && hour < 24) || (hour >= 0 && hour < 5)) {
      condition = condition.replace("Clear", "Clear/Windy");
    } else {
      // For daytime conditions, add /Windy but keep the original icon
      condition = condition.replace(timePeriod, `/Windy ${timePeriod}`);
    }
  }

  // Pure windy condition (when it's the main weather type)
  if (weatherMain === "wind" || weatherDesc.includes("windy")) {
    condition = `Windy ${timePeriod}`;
    iconName = "windy";
  }

  return { condition, icon: getWeatherIcon(iconName) };
};

// Fetch weather data from OpenWeatherMap API
export const fetchWeather = async (latitude, longitude) => {
  try {
    // Using OpenWeatherMap API (free tier)
    const API_KEY = "dd25475f821352ad00f365390c0e2d6a"; // Replace with your actual API key
    
    if (API_KEY === "YOUR_API_KEY_HERE") {
      console.warn("Please set your OpenWeatherMap API key in weatherService.js");
      // Return default based on time
      const timePeriod = getTimePeriod();
      return {
        condition: `Sunny ${timePeriod}`,
        icon: getWeatherIcon("sunny"),
        temperatureC: null,
        humidity: null,
        windKph: null,
      };
    }
    
    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${API_KEY}&units=metric`;
    
    const response = await axios.get(url);
    const { condition, icon } = determineWeatherCondition(response.data);
    const temperatureC = Math.round(response.data.main?.temp ?? 0);
    const humidity = Math.round(response.data.main?.humidity ?? 0);
    const windKph = Math.round(((response.data.wind?.speed ?? 0) * 3.6) * 10) / 10; // m/s to km/h
    return { condition, icon, temperatureC, humidity, windKph };
  } catch (error) {
    console.error("Weather fetch error:", error);
    // Return default weather on error
    const timePeriod = getTimePeriod();
    return {
      condition: `Sunny ${timePeriod}`,
      icon: getWeatherIcon("sunny"),
      temperatureC: null,
      humidity: null,
      windKph: null,
    };
  }
};
