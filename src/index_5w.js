function geoCoordFromCityName(city){
  let apiUrl = `https://api.openweathermap.org/geo/1.0/direct?q=${city}&limit=5&appid=${apiKey}`;
  axios.get(apiUrl).then(apiDataGeo);
}

function onPressButton(event) {
  event.preventDefault();
  let textField = document.querySelector("form .search-input");
  let city = textField.value;
  city = city.trim().toLowerCase();
  city = capitalise(city);
  geoCoordFromCityName(city);
  htmlUpdateCity(city);
  textField.value = null;
  htmlUpdateDate(city);
}

function capitalise(cityName) {
  let cityWords = cityName.split(" ");
  for (let i = 0; i < cityWords.length; i++) {
    cityWords[i] = cityWords[i][0].toUpperCase() + cityWords[i].substr(1);
  }
  cityName = cityWords.join(" ");
  return cityName;
}

function htmlUpdateCity(cityName) {
  let h1City = document.querySelector("div .current-city");
  h1City.innerHTML = cityName;
}

function forecastGenerator(cityName, days, day) {
  let dayForecast="";
  let forecastHTML="";
  const forecastSection = document.querySelector(".forecast");

  for (let i = 1; i < 7; i++) {
    day = day + 1;
    if (day>6) {
      day=day-7;
    }
    dayForecast=days[day].substring(0,3);
    forecastHTML=forecastHTML+`<div class="day-forecast">
                <div class="day-forecast-name">${dayForecast}</div>
                <div class="icon-wrapper" id="icon${i}">
                  <img src="src/images/icons/sun100.png" class="day-forecast-icon" alt="🌤">
                </div>
                <div class="day-forecast-temperature" id="tempDay${i}">
                  <span class="day-forecast-temp">15°</span>
                  <span class="day-forecast-temp-realFeel">9°</span>
                </div>
              </div>
                `;
  }
  forecastSection.innerHTML=forecastHTML;
  geoCoordFromCityName(cityName);
}

function forecastInserter(response) {
 console.log(response);
 let idTemp="";
 let idIcon="";
 let icon="";
  for (let i = 1; i < 7; i++) {
    idTemp=`#tempDay${i}`;
    let tempSection = document.querySelector(idTemp);
    tempSection.innerHTML=`<span class="day-forecast-temp">
                                ${Math.round(response.data.daily[i].temp.eve)}°
                           <span class="tooltip">Average temp</span>
                           </span>
                           <span class="day-forecast-temp-realFeel">
                                ${Math.round(response.data.daily[i].feels_like.eve)}°
                           <span class="tooltip">Real-feel temp</span>
                           </span>`;
    //console.log(`temperatura in ${i}day ${response.data.daily[i].temp.eve}`);
    //console.log(`RealFeel temp in ${i}day ${response.data.daily[i].feels_like.eve}`)
    idIcon=`#icon${i}`;
    let iconSection = document.querySelector(idIcon);
    icon = dayWeatherIconSelection(response.data.daily[i].clouds);
    iconSection.innerHTML=`<img src="${icon}" class="day-forecast-icon" alt="weather icon">`;
    //console.log(`Clouds density in ${i}day ${response.data.daily[i].clouds}`)
  }
}


function htmlUpdateDate(cityName) {
  let days = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thirsay",
    "Friday",
    "Saturday",
  ];
  let now = new Date();
  let day = now.getDay();
  //let hours = 6;
  let hours = now.getHours();
  let minutes = now.getMinutes();
  let currentDayTime = document.querySelector(
    ".current-weather #currentDate"
  );
  let body = document.getElementById("global");

  if (hours > 20 || hours < 5) {
    body.style[
      "background"
    ] = `url("src/images/night_sky.jpg") no-repeat center fixed`;
    body.style["background-size"] = `cover`;
  } else if ((hours > 5 && hours < 7) || (hours > 18 && hours < 20)) {
    body.style[
      "background"
    ] = `url("src/images/evening_sky.jpg") no-repeat center fixed`;
    body.style["background-size"] = `cover`;
  } else {
    body.style[
      "background"
    ] = `url("src/images/day_sky.jpg") no-repeat center fixed`;
    body.style["background-size"] = `cover`;
  }

  if (hours < 10) {
    hours = `0${hours}`;
  }

  if (minutes < 10) {
    minutes = `0${minutes}`;
  }

  currentDayTime.innerHTML = `${days[day]} ${hours}:${minutes}`;
  forecastGenerator(cityName, days, day)
}

function forecastApiRequest(lat, lon) {
  const forecastUrlApi=`https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&exclude=current,hourly,minutely,alerts&appid=${apiKey}&units=metric`;
  axios.get(forecastUrlApi).then(forecastInserter);
}

function apiDataGeo(response) {
  //console.log(response.data[0].lat);
  //console.log(response.data[0].lon);
  //console.log(response);
  try {
    let lat = response.data[0].lat;
    let lon = response.data[0].lon;
    let apiUrlGeo = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;
    forecastApiRequest(lat, lon)
    axios.get(apiUrlGeo).then(changeTemperature);
  } catch (err) {
    //console.log(`The error is: ${err.message}`);
    htmlUpdateCity("!Incorrect request!");
    let h1Component = document.getElementById("currentTemp");
    h1Component.innerHTML = `--`;
    //alert(`We have no any information about city you requested`);
    throw new Error("The search request is incorrect!");
  }
}

function apiDataCity(response) {
  //console.log(response);
  const weatherData={
    temperature: 0,
    humidity: 0,
    wind: 0,
    cloudy: 0,  
    cityTime: 0,
    sunRise: 0,
    sunSet: 0,
    description: "",
  };
  weatherData.temperature = response.data.main.temp;
  weatherData.humidity = response.data.main.humidity;
  weatherData.wind = response.data.wind.speed;
  weatherData.cloudy = response.data.clouds.all;
  weatherData.cityTime = response.data.dt;
  weatherData.sunRise = response.data.sys.sunrise;
  weatherData.sunSet = response.data.sys.sunset;
  weatherData.description = response.data.weather[0].description;

  return weatherData;
}

function dayWeatherIconSelection(cloudy) {
  let icon="";
  if (cloudy>25 && cloudy<51) {
    icon = "src/images/icons/sun50.png";
  } else if (cloudy>=51 && cloudy<76) {
    icon = "src/images/icons/sun25.png";
  } else if (cloudy>=76 && cloudy<85) {
    icon = "src/images/icons/clouds.png";
  } else if (cloudy>=85) {
    icon = "src/images/icons/clouds_thick.png";
  } else {
    icon = "src/images/icons/sun100.png";
  }
  return icon;
}

function nightWeatherIconSelection(cloudy) {
  let icon="";
  if (cloudy<30) {
    icon = "src/images/icons/night_clear_sky.png";
  } else if (cloudy>=30 && cloudy<76) {
    icon = "src/images/icons/night_sky_clouds50.png";
  }
  return icon;
}

function changeTemperature(response) {
  const weatherData = apiDataCity(response);
  //console.log(weatherData.temperature);
  //console.log(weatherData.humidity);
  //console.log(weatherData.wind);
  //console.log(weatherData.cloudy);
  //console.log(weatherData.cityTime);
  //console.log(weatherData.sunRise);
  //console.log(weatherData.sunSet);
  //console.log(weatherData.description);
  //console.log(Math.round(temperature));
  let h1Component = document.getElementById("currentTemp");
  h1Component.innerHTML = `${Math.round(weatherData.temperature)}`;

  const weatherDescription= document.getElementById("weatherDescription");
  weatherDescription.innerHTML = `, ${weatherData.description} <br />
                Humidity: <strong>${weatherData.humidity}%</strong>, Wind: <strong>${weatherData.wind}km/h</strong>`;

  const weatherIcon= document.querySelector(".current-temperature-icon");
  if (weatherData.cityTime>weatherData.sunSet || weatherData.cityTime<weatherData.sunRise) {
    weatherIcon.src = nightWeatherIconSelection(weatherData.cloudy);
  } else {
    weatherIcon.src = dayWeatherIconSelection(weatherData.cloudy);
  }
  if (weatherData.cloudy>=85) {
    weatherIcon.src = dayWeatherIconSelection(weatherData.cloudy);
  }
}

const apiKey = "5201594abea9f3e38b70e65b11a80c24";
const units = "metric";
let reloadsCount=0;

window.onload = htmlUpdateDate("Paris");

let citySearchForm = document.querySelector("#search-form");
citySearchForm.addEventListener("submit", onPressButton);
