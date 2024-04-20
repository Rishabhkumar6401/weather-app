const express = require('express');
const axios = require('axios');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const PORT = process.env.PORT || 5000;
const weatherAPIKey = '5942339e44d440fe9ce65159242004'; 
let latitude, longitude; 

app.use(express.json());
app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true,
}));

// API endpoint for weather data
app.post('/api/weather', async (req, res) => {
    const { latitude: lat, longitude: lon } = req.body;
    latitude = lat; 
    longitude = lon;

    try {
        // Call weather API based on coordinates
        const weatherResponse = await axios.get(
            `https://api.weatherapi.com/v1/current.json?key=${weatherAPIKey}&q=${latitude},${longitude}&aqi=no`
        );

        const location = weatherResponse.data.location.name; // Updated to get city name from response
        const temperature = weatherResponse.data.current.temp_c;
        const conditions = weatherResponse.data.current.condition.text;

        res.json({ location, temperature, conditions });
    } catch (error) {
        console.error('Error fetching weather data:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// WebSocket for real-time updates
io.on('connection', (socket) => {
    console.log('Client connected');

    // Periodically emit weather updates
    const interval = setInterval(async () => {
        try {
            // Fetch weather data
            const weatherResponse = await axios.get(
                `https://api.weatherapi.com/v1/current.json?key=${weatherAPIKey}&q=${latitude},${longitude}&aqi=no`
            );

            const temperature = weatherResponse.data.current.temp_c;
            const conditions = weatherResponse.data.current.condition.text;

            // Emit updated weather data to clients
            socket.emit('weatherUpdate', { temperature, conditions });
        } catch (error) {
            console.error('Error fetching weather data:', error);
        }
    }, 1000); // Update every 1 second

    socket.on('disconnect', () => {
        console.log('Client disconnected');
        clearInterval(interval);
    });
});

server.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});
