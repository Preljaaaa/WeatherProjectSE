const express = require('express');
const axios = require('axios');
const morgan = require('morgan');

const app = express();
const port = 3000;

app.use(morgan('dev'));
app.use(express.json());

// Define API endpoints
app.get('/weather/current', async (req, res) => {
  try {
    const location = req.query.location;

    if (!location) {
      return res.status(400).json({ error: 'Location is required.' });
    }

    const weatherData = await getWeatherData(location);

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

    const forecastData = await getForecastData(location);

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

    const historyData = await getHistoryData(location, startDate, endDate);

    res.json(historyData);
  } catch (error) {
    console.error('Error retrieving weather history:', error);
    res.status(500).json({ error: 'An error occurred while retrieving weather history.' });
  }
});

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
