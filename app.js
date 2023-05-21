const express = require('express');
const axios = require('axios');
const morgan = require('morgan');
const basicAuth = require('express-basic-auth');

const app = express();
const port = 3000;

app.use(morgan('dev'));
app.use(express.json());

const cacheDuration = 300; // 5 minutes
const cache = {};

// Define a sample set of users with their passwords
const users = {
  admin: 'admin',
};

// Middleware for basic authentication
app.use(
  basicAuth({
    authorizer: (username, password) => {
      const user = users[username];
      return user && user === password;
    },
    unauthorizedResponse: 'Unauthorized',
  })
);

app.get('/weather/current', async (req, res) => {
  try {
    const location = req.query.location;

    if (!location) {
      return res.status(400).json({ error: 'Location is required.' });
    }

    const cacheKey = `current_${location}`;
    const cachedData = cache[cacheKey];

    if (cachedData && isCacheValid(cachedData.timestamp, cacheDuration)) {
      return res.json(cachedData.data);
    }

    const weatherData = await getWeatherData(location);

    // Update cache with new data
    cache[cacheKey] = {
      data: weatherData,
      timestamp: getCurrentTimestamp(),
    };

    res.json(weatherData);
  } catch (error) {
    console.error('Error retrieving current weather:', error);
    res.status(500).json({ error: 'An error occurred while retrieving current weather.' });
  }
});

app.get('/weather/forecast', async (req, res) => {
  try {
    const location = req.query.location;

    if (!location) {
      return res.status(400).json({ error: 'Location is required.' });
    }

    const cacheKey = `forecast_${location}`;
    const cachedData = cache[cacheKey];

    if (cachedData && isCacheValid(cachedData.timestamp, cacheDuration)) {
      return res.json(cachedData.data);
    }

    const forecastData = await getForecastData(location);

    // Update cache with new data
    cache[cacheKey] = {
      data: forecastData,
      timestamp: getCurrentTimestamp(),
    };

    res.json(forecastData);
  } catch (error) {
    console.error('Error retrieving weather forecast:', error);
    res.status(500).json({ error: 'An error occurred while retrieving weather forecast.' });
  }
});

app.get('/weather/history', async (req, res) => {
  try {
    const location = req.query.location;
    const startDate = req.query.start_date;
    const endDate = req.query.end_date;

    if (!location || !startDate || !endDate) {
      return res.status(400).json({ error: 'Location, start date, and end date are required.' });
    }

    const cacheKey = `history_${location}_${startDate}_${endDate}`;
    const cachedData = cache[cacheKey];

    if (cachedData && isCacheValid(cachedData.timestamp, cacheDuration)) {
      return res.json(cachedData.data);
    }

    const historyData = await getHistoryData(location, startDate, endDate);

    // Update cache with new data
    cache[cacheKey] = {
      data: historyData,
      timestamp: getCurrentTimestamp(),
    };

    res.json(historyData);
  } catch (error) {
    console.error('Error retrieving weather history:', error);
    res.status(500).json({ error: 'An error occurred while retrieving weather history.' });
  }
});

// Function to check if cache is still valid
function isCacheValid(timestamp, duration) {
  const now = getCurrentTimestamp();
  return now - timestamp <= duration;
}

// Function to get current timestamp
function getCurrentTimestamp() {
  return Math.floor(Date.now() / 1000);
}

// Function to fetch current weather
async function getWeatherData(location) {
  const apiKey = '6853c5df3853d3b4f729a1f69dd97b40';
  const apiUrl = `https://api.openweathermap.org/data/2.5/weather?q=${location}&appid=${apiKey}`;

  const response = await axios.get(apiUrl);
  return response.data;
}

// Function to fetch weather forecast
async function getForecastData(location) {
  const apiKey = '6853c5df3853d3b4f729a1f69dd97b40';
  const apiUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${location}&appid=${apiKey}`;

  const response = await axios.get(apiUrl);
  return response.data;
}

// Function to fetch weather history
async function getHistoryData(location, startDate, endDate) {
  const apiKey = '6853c5df3853d3b4f729a1f69dd97b40';
  const apiUrl = `https://api.openweathermap.org/data/2.5/history/city?q=${location}&start=${startDate}&end=${endDate}&appid=${apiKey}`;

  const response = await axios.get(apiUrl);
  return response.data;
}

app.listen(port, () => {
  console.log(`Weather app API is listening at http://localhost:${port}`);
});