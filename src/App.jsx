import React, { useState, useEffect } from 'react';
import axios from 'axios';
import io from 'socket.io-client';
import './App.css';
import sunnyIcon from './assets/sunny.png';
import cloudyIcon from './assets/cloudy.png';
import rainyIcon from './assets/rainy.png';


function App() {
  const [weatherData, setWeatherData] = useState(null);

  useEffect(() => {
    const fetchWeatherData = async () => {
      try {
        const position = await getCurrentPosition();
        const { latitude, longitude } = position.coords;
        const response = await axios.post('http://localhost:5000/api/weather', { latitude, longitude });
        setWeatherData(response.data);

        const socket = io();
        socket.on('weatherUpdate', (data) => {
          setWeatherData(data);
        });
      } catch (error) {
        console.error('Error fetching weather data:', error);
      }
    };

    fetchWeatherData();
  }, []);

  const getCurrentPosition = () => {
    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resolve, reject);
    });
  };

  const renderWeatherIcon = () => {
    if (!weatherData) return null;

    const conditions = weatherData.conditions.toLowerCase();
    switch (true) {
      case conditions.includes('clear'):
        return <img style={{height:"53px"}} src={sunnyIcon} alt="Sunny" />;
      case conditions.includes('cloud'):
        return <img style={{height:"53px"}} src={cloudyIcon} alt="Cloudy" />;
      case conditions.includes('rain'):
        return <img style={{height:"53px"}} src={rainyIcon} alt="Rainy" />;
      
      default:
        return null;
    }
  };

  return (
    <div className="app-container">
      <div className="weather-container">
        <header>
          <h1>Live Weather App</h1>
        </header>
        <div className="weather-info">
          {weatherData ? (
            <div>
              <h2>{weatherData.location}</h2>
              <div className="weather-icon">{renderWeatherIcon()}</div>
              <p className="temperature">{weatherData.temperature}°C</p>
              <p>{weatherData.conditions}</p>
            </div>
          ) : (
            <p>Loading...</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
