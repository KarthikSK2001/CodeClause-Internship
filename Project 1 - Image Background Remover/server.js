const express = require('express');
const multer = require('multer');
const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Multer middleware for handling file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Serve static files from the 'public' folder
app.use(express.static('public'));

app.post('/removebg', upload.single('image'), async (req, res) => {
  try {
    // Check if the API key is provided
    const apiKey = process.env.REMOVE_BG_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: 'API key is missing.' });
    }

    // Create form data with the uploaded image
    const formData = new FormData();
    formData.append('size', 'auto');
    formData.append('image_file', req.file.buffer, 'uploaded-image.png');

    // Call remove.bg API
    const response = await axios.post('https://api.remove.bg/v1.0/removebg', formData, {
      headers: {
        ...formData.getHeaders(),
        'X-Api-Key': apiKey,
      },
      responseType: 'arraybuffer',
    });

    // Save the result to a file
    const outputPath = path.join(__dirname, 'public', 'no-bg.png');
    fs.writeFileSync(outputPath, response.data);

    // Send the result path to the client
    res.json({ success: true, resultPath: '/no-bg.png' });
  } catch (error) {
    console.error('Error:', error.message);
    res.status(500).json({ error: 'Server error.' });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
