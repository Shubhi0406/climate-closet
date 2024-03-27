// Secure on server-side if plan to deploy
import { apiKey } from "./config.js";

const clothing = {
    "Below -10°C": ["Heavyweight insulated coat, thermal underwear, thick socks, insulated boots, gloves, scarf, and a hat.", "Wool, down, fleece, and insulated materials."],
    "-10°C to 0°C": ["Insulated coat, sweater or fleece, thermal pants, warm socks, insulated boots, gloves, and a hat.", "Fleece, wool, down, and thermal fabrics."],
    "0°C to 10°C": ["Medium-weight coat or jacket, long-sleeve shirt or sweater, pants or jeans, light gloves, and closed shoes or boots.", "Fleece, wool, and light synthetic fabrics."],
    "10°C to 20°C": ["Light jacket or sweater, T-shirt or blouse, jeans or lightweight pants, closed shoes or sandals.", "Cotton, linen, and light synthetic fabrics."],
    "Above 20°C": ["Short-sleeve shirts, shorts or lightweight pants, sandals or sneakers.", "Cotton, linen, and breathable synthetic fabrics."],
    "Wind": "High speed winds can make temperatures feel even colder, so wind repellent clothing is essential. Add a soft mid-layer for extra warmth if needed, and consider wearing a wind breaker or a lightweight jacket.",
    "Rain": "It might rain! Remember to wear waterproof outer layers or carry an umbrella."
}

var resultArray;

var slideIndex = 0;
var selected = 0;

function carousel() {
  let x = document.getElementsByClassName("mySlides");
  for (let i = 0; i < x.length; i++) {
    x[i].style.display = "none";
  }
  slideIndex++;
  if (slideIndex > x.length) {slideIndex = 1}
  x[slideIndex-1].style.display = "block";
  setTimeout(carousel, 2000); // Change image every 2 seconds
}

// Fetch weather forecast data from OpenWeatherMap API
function fetchWeatherForecast(location) {
    const apiUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${location}&appid=${apiKey}&units=metric`;

    return fetch(apiUrl)
        .then(response => response.json())
        .then(data => {
            return data; // Return the daily forecast data
        })
        .catch(error => {
            console.error('Error fetching weather forecast:', error);
            return null;
        });
}

function celsiusToFahrenheit(celsius) {
    return (celsius * 9 / 5) + 32;
}

// Function to update weather forecast display on the webpage
function updateWeatherForecast(forecastData) {
    if (forecastData.message == "city not found") {
        document.getElementsByClassName('error')[0].textContent = "City not found. Please check the spelling and try again.";
    } else {
        document.getElementsByClassName('error')[0].textContent = "";
    }
    let temperatureData = {};
    resultArray = [];
    forecastData.list.forEach(forecast => {
        // assuming the datetime format is consistent
        const date = forecast.dt_txt.split(' ')[0];

        if (!temperatureData[date]) {
            temperatureData[date] = {
                maxTemp: Math.round(forecast.main.temp_max),
                minTemp: Math.round(forecast.main.temp_min),
                weather: forecast.weather[0].main
            };
        } else {
            temperatureData[date].maxTemp = Math.max(temperatureData[date].maxTemp, Math.round(forecast.main.temp_max));
            temperatureData[date].minTemp = Math.min(temperatureData[date].minTemp, Math.round(forecast.main.temp_min));
        }
    });

    // Transfer temperatureData map's data to array
    for (const date in temperatureData) {
        resultArray.push({ date: date, max: temperatureData[date].maxTemp, min: temperatureData[date].minTemp, weather: temperatureData[date].weather });
    }

    // Sort the resultArray by date
    resultArray.sort((a, b) => {
        return new Date(a.date) - new Date(b.date);
    });
    
    const forecastDiv = document.getElementsByClassName("temperature-card");
    for (let i = 0; i < forecastDiv.length; i++) {
      if (resultArray.length == i) {
        forecastDiv[i].style.visibility = "hidden";
        break;
      } else {
        forecastDiv[i].style.visibility = "visible";
      }
      forecastDiv[i].querySelector('h2').textContent = `${resultArray[i].max} / ${resultArray[i].min}°C`;
      forecastDiv[i].querySelector('p').textContent = `${Math.round(celsiusToFahrenheit(resultArray[i].max))} / ${Math.round(celsiusToFahrenheit(resultArray[i].min))}°F`;
      forecastDiv[i].querySelector('.date').textContent = resultArray[i].date;
      forecastDiv[i].querySelector('img').src = `images\\${resultArray[i].weather}.png`;
    }
    updateClothing(selected);
}

// Update clothing info based on weather of selected date
function updateClothing(selectedIndex) {
    const avg = (resultArray[selectedIndex].max + resultArray[selectedIndex].min) / 2;
    let text;
    let image1 = document.getElementsByClassName("mySlides")[0];
    let image2 = document.getElementsByClassName("mySlides")[1];
    if (avg <= -10) {
        text = "Below -10°C";
        image1.src = "images/below-10-1.jpg";
        image2.src = "images/below-10-2.png";
    } else if (avg <= 0) {
        text = "-10°C to 0°C";
        image1.src = "images/below0-1.png";
        image2.src = "images/below0-2.png";
    } else if (avg <= 10) {
        text = "0°C to 10°C";
        image1.src = "images/below10-1.png";
        image2.src = "images/below10-2.png";
    } else if (avg <= 20) {
        text = "10°C to 20°C";
        image1.src = "images/below20-1.png";
        image2.src = "images/below20-2.png";
    } else {
        text = "Above 20°C";
        image1.src = "images/above20-1.png";
        image2.src = "images/above20-2.png";
    }
    document.getElementsByClassName("range")[0].textContent = text;
    document.getElementsByClassName("suggestions-clothing")[0].textContent = clothing[text][0];
    document.getElementsByClassName("suggestions-materials")[0].textContent = clothing[text][1];
    if (["Rain", "Wind"].includes(resultArray[selectedIndex].weather)) {
        document.getElementsByClassName("extra")[0].textContent = clothing[resultArray[selectedIndex].weather];
    } else {
        document.getElementsByClassName("extra")[0].textContent = "";
    }
}

// Handle search button click event
function handleSearch() {
    const locationInput = document.getElementById('locationInput');
    const location = locationInput.value.trim();

    fetchWeatherForecast(location)
        .then(forecastData => {
            updateWeatherForecast(forecastData);
        });
}

// Event listener for search button click event
document.getElementById("locationInput")
    .addEventListener("keyup", function(event) {
    event.preventDefault();
    if (event.keyCode === 13) {
        document.getElementById("searchBtn").click();
    }
});

// Search immediately after loading
window.addEventListener('load', handleSearch);

document.addEventListener('DOMContentLoaded', function() {
    carousel();
    const temperatureCards = document.querySelectorAll('.temperature-card');

    // Add click event listener to each card
    temperatureCards.forEach(function(card) {
        card.addEventListener('click', function() {
            // Remove selected class from all cards
            temperatureCards.forEach(function(card) {
                card.classList.remove('selected');
            });

            // Add selected class to the clicked card
            this.classList.add('selected');
            selected = Array.from(temperatureCards).indexOf(this);
            updateClothing(selected);
        });
    });
});

const searchBtn = document.getElementById('searchBtn');
searchBtn.addEventListener('click', handleSearch);
