const express = require('express');
const ejs = require('ejs');
const axios = require('axios');
const app = express();

app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

// Load environment variables
require('dotenv').config();

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

// Render the scheduling page
app.get('/', (req, res) => {
  res.render('index');
});

// Handle form submission to schedule a meeting
app.post('/schedule', async (req, res) => {
  const { topic, date, time, duration } = req.body;

  try {
    // Prepare Zoom API request payload
    const payload = {
      topic,
      type: 2, // Scheduled Meeting
      start_time: `${date}T${time}:00`,
      duration,
    };

    const response = await axios.post(
      'https://api.zoom.us/v2/users/me/meetings',
      payload,
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.ZOOM_API_SECRET}`,
        },
      }
    );

    const meetingId = response.data.id;

    // Redirect to the Zoom meeting URL or display the meeting ID
    res.send(`Meeting ID: ${meetingId}`);
  } catch (error) {
    console.error(error);
    res.status(500).send('Error scheduling the meeting.');
  }
});

// Handle starting a meeting
app.post('/start', async (req, res) => {
  const { meetingId } = req.body;

  try {
    // Redirect to the Zoom meeting URL
    res.redirect(`https://zoom.us/j/${meetingId}`);
  } catch (error) {
    console.error(error);
    res.status(500).send('Error starting the meeting.');
  }
});
