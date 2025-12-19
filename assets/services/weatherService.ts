import axios from "axios";

interface WeatherData {
  weather: Array<{
    main: string;
    description: string;
  }>;
  wind: {
    speed: number;
  };
  main: {
    temp: number;
    humidity: number;
  };
}

interface WeatherResponse {
  condition: string;
  icon: NodeRequire;
  temperatureC?: number;
  humidity?: number;
  windKph?: number;
}

// Get time of day period
export const getTimePeriod = (): string => {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return "Morning";
  if (hour >= 12 && hour < 18) return "Afternoon";
  if (hour >= 18 && hour < 24) return "Evening";
  return "Dawn";
};

// Get weather icon based on condition
export const getWeatherIcon = (iconName: string): NodeRequire => {
  const icons: { [key: string]: NodeRequire } = {
    sunny: require("../image/sunnyday.png"),
    rainy: require("../image/rainy.png"),
    cloudy: require("../image/CloudyStat.png"),
    windy: require("../image/windy.png"),
    clear: require("../image/clear.png"),
  };
  return icons[iconName] || icons.sunny;
};

// Determine weather condition text and icon
export const determineWeatherCondition = (weatherData: WeatherData): WeatherResponse => {
  const timePeriod = getTimePeriod();
  const hour = new Date().getHours();
  const weatherMain = weatherData.weather[0].main.toLowerCase();
  const weatherDesc = weatherData.weather[0].description.toLowerCase();
  const windSpeed = weatherData.wind.speed;
  const isWindy = windSpeed > 5; // Consider windy if > 5 m/s

  let condition = "";
  let iconName = "sunny";

  // STORMY - uses rainy.png for all times
  if (weatherMain === "thunderstorm" || weatherDesc.includes("storm")) {
    if (hour >= 5 && hour < 12) {
      condition = "Stormy Morning";
    } else if (hour >= 12 && hour < 18) {
      condition = "Stormy Afternoon";
    } else if (hour >= 18 && hour < 24) {
      condition = "Stormy Evening";
    } else {
      condition = "Stormy Dawn";
    }
    iconName = "rainy"; // Stormy always uses rainy.png
    return { condition, icon: getWeatherIcon(iconName) };
  }

  // RAINY - uses rainy.png for all times
  if (weatherMain === "rain" || weatherMain === "drizzle") {
    if (hour >= 5 && hour < 12) {
      condition = "Rainy Morning";
    } else if (hour >= 12 && hour < 18) {
      condition = "Rainy Afternoon";
    } else if (hour >= 18 && hour < 24) {
      condition = "Rainy Evening";
    } else {
      condition = "Rainy Dawn";
    }
    iconName = "rainy";
  }
  // CLOUDY - uses cloudy.png for all times
  else if (weatherMain === "clouds") {
    if (hour >= 5 && hour < 12) {
      condition = "Cloudy Morning";
    } else if (hour >= 12 && hour < 18) {
      condition = "Cloudy Afternoon";
    } else if (hour >= 18 && hour < 24) {
      condition = "Cloudy Evening";
    } else {
      condition = "Cloudy Dawn";
    }
    iconName = "cloudy";
  }
  // WINDY - uses windy.png for all times
  else if (isWindy || weatherMain === "wind" || weatherDesc.includes("windy")) {
    if (hour >= 5 && hour < 12) {
      condition = "Windy Morning";
    } else if (hour >= 12 && hour < 18) {
      condition = "Windy Afternoon";
    } else if (hour >= 18 && hour < 24) {
      condition = "Windy Evening";
    } else {
      condition = "Windy Dawn";
    }
    iconName = "windy";
  }
  // CLEAR/SUNNY - different icons for day vs night
  else if (weatherMain === "clear") {
    if (hour >= 5 && hour < 12) {
      condition = "Sunny Morning";
      iconName = "sunny"; // sunnyday.png
    } else if (hour >= 12 && hour < 18) {
      condition = "Sunny Afternoon";
      iconName = "sunny"; // sunnyday.png
    } else if (hour >= 18 && hour < 24) {
      condition = "Clear Evening";
      iconName = "clear"; // clear.png
    } else {
      condition = "Clear Dawn";
      iconName = "clear"; // clear.png
    }
  }
  // DEFAULT SUNNY
  else {
    if (hour >= 5 && hour < 12) {
      condition = "Sunny Morning";
    } else if (hour >= 12 && hour < 18) {
      condition = "Sunny Afternoon";
    } else if (hour >= 18 && hour < 24) {
      condition = "Clear Evening";
      iconName = "clear";
    } else {
      condition = "Clear Dawn";
      iconName = "clear";
    }
    if (iconName !== "clear") {
      iconName = "sunny";
    }
  }

  return { condition, icon: getWeatherIcon(iconName) };
};

// Fetch weather data from OpenWeatherMap API
export const fetchWeather = async (
  latitude: number,
  longitude: number
): Promise<WeatherResponse> => {
  try {
    // Using OpenWeatherMap API (free tier)
    const API_KEY = "dd25475f821352ad00f365390c0e2d6a"; // Replace with your actual key from https://openweathermap.org/api
    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${API_KEY}&units=metric`;

    const response = await axios.get<WeatherData>(url);
    const weatherData = response.data;

    const {
      condition,
      icon,
    } = determineWeatherCondition(weatherData);
    const temperatureC = Math.round(weatherData.main.temp);
    const humidity = Math.round(weatherData.main.humidity);
    const windKph = Math.round((weatherData.wind.speed * 3.6) * 10) / 10; // Convert m/s to km/h

    return {
      condition,
      icon,
      temperatureC,
      humidity,
      windKph,
    };
  } catch (error) {
    console.error("Weather fetch error:", error);
    // Return default values on error
    return {
      condition: "Sunny Morning",
      icon: getWeatherIcon("sunny"),
      temperatureC: 22,
      humidity: 60,
      windKph: 5,
    };
  }
};
