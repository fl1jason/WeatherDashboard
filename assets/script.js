const WEATHER_API_BASE_URL = 'https://api.openweathermap.org';
const WEATHER_API_KEY = 'd91f911bcf2c0f925fb6535547a5ddc9';
const MAX_DAILY_FORECAST = 5;

const recentLocations = [];

const getLocation = () => {

    // Get the Location enteret by the user
    const userLocation = locationInput.value;
    
    // Verify it's valid, if it is, lookup the location
    if (userLocation === '') {
        setLocationError('Please enter a location');
    } else {
        lookupLocation(userLocation);
    }
}

// Clear the Last Error on the Page
const clearError = () => {
    const errorDisplay = document.getElementById('error');
    errorDisplay.textContent = '';
}

// Display an Error
const setLocationError = (text) => {
    const errorDisplay = document.getElementById('error');
    errorDisplay.textContent = text;
    
    // set a timer to clear it after 3 seconds
    setTimeout(clearError, 3000);
}

const addRecentLocation = (location) => {
    if (!location) return;
    
    // Add it to the List
    recentLocations.push(location);

    // Save to Local Storage
    localStorage.setItem('recentLocations', JSON.stringify(recentLocations));

    // Update the Recent Locations List
    updateRecentLocationsList();
}

const updateRecentLocationsList = () => {

    // Get the recent locations list
    const recentLocationsList = document.getElementById('recent-locations');

    // Clear any current entries
    recentLocationsList.innerHTML = '';

    // Add the new entries
    recentLocations.forEach(location => {

        const newLocation = document.createElement('div');
        newLocation.classList.add('recent');
        newLocation.addEventListener('click', onClickRecentLocation);
        console.log(location);
        newLocation.textContent = location?.name;

        // add the new Day to the list to be displayed on the page
        recentLocationsList.appendChild(newLocation);
    });
}

const loadRecentLocations = () => {

    // Pull the cached recent locations from local storage
    const locations = localStorage.getItem('recentLocations');
    if (locations) {
        
        // Push the Recent locations in to the Local Array
        recentLocations.push(...JSON.parse(locations));
        
        // Update the Recent Locations List
        updateRecentLocationsList();
    }
}

const onClickRecentLocation = (event) => {

    // What was the Location solected?
    const locationName = event.target.textContent;

    // Find it in our list and display it
    recentLocations.filter(location => {
        if (location.name === locationName) {
            displayWeather(location);
        }
    });
}

const lookupLocation = (search) => {

    // Lookup the location to get the Lat/Lon
    var apiUrl = `${WEATHER_API_BASE_URL}/geo/1.0/direct?q=${search}&limit=5&appid=${WEATHER_API_KEY}`;
    fetch(apiUrl)
        .then(response => response.json())
        .then(data => {

            // Pick the First location from the results
            const location = data[0];
            
            // Add the Location to the Recent Locations List
            addRecentLocation(location);

            // Display the Weather
            displayWeather(location);
        })
}

const displayCurrentWeather = (weatherData) => {
    const currentWeather = weatherData.current;

    // Display the Current Weather at the top of the Dashboard
    document.getElementById('temp_value').textContent = `${currentWeather.temp}°`;
    document.getElementById('wind_value').textContent = `${currentWeather.wind_speed}MPH`;
    document.getElementById('humid_value').textContent = `${currentWeather.humidity}%`;
    document.getElementById('uvi_value').textContent = `${currentWeather.uvi}`;
}

const displayWeatherForecast = (weatherData) => {

    // Get the Daily Forecasts
    const dailyData = weatherData.daily;

    // Show the Forecast section
    document.getElementById('forecast').style.display = 'block';

    // Clear any current Forecasts
    const forecastList = document.getElementById('forecast-days');
    forecastList.innerHTML = '';

    // Add the new Forecasts so they are displayed
    for (let i = 0; i < MAX_DAILY_FORECAST; i++) {

        const dailyForecast = dailyData[i];
        const day = new Date(dailyForecast.dt * 1000).toLocaleDateString('en-GB', { weekday: 'long' });
        const temp = `${dailyForecast.temp.day}°`;
        const humidity = `${dailyForecast.humidity}%`;
        const wind = `${dailyForecast.wind_speed}MPH`;
        
        const newForecast = document.createElement('div');
        newForecast.classList.add('forecast-day');
        newForecast.innerHTML = `<div class="weather-info">
                <div class="date">
                    <span>${day}</span>
                </div>
                <div class="temperature">
                    <span>${temp}</span>
                </div>
                <div class="wind">
                    <span>${wind}</span>
                </div>
                <div class="humidity">
                    <span>${humidity}</span>
                </div>
            </div>`;
        forecastList.appendChild(newForecast);
    }
}

const getWeather = (lat, lon) => {

    // Get the Weather for the cached location
    var apiUrl = `${WEATHER_API_BASE_URL}/data/2.5/onecall?lat=${lat}&lon=${lon}&units=imperial&exclude=minutely,hourly&appid=${WEATHER_API_KEY}`;
    fetch(apiUrl)
        .then(response => response.json())
        .then(data => {
            
            // Show the Current Weather Forecast
            displayCurrentWeather(data);

            // Show the 5 Day Weather Forecast
            displayWeatherForecast(data);
        })
}

// Display the Weather for the cached location
const displayWeather = (weatherData) => {
    document.getElementById('location-name').textContent = `${weatherData.name}, ${weatherData.country}`;
    
    getWeather(weatherData.lat, weatherData.lon);
}

// Search Text and Search Button
const locationInput = document.getElementById('location');
const searchButton  = document.getElementById('search');

searchButton.addEventListener('click', getLocation);

// Load in the Recent Locations List
loadRecentLocations();