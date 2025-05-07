const express = require('express');
const router = express.Router();
const axios = require('axios');
const FormData = require('form-data');

router.post('/image-to-text', async (req, res) => {
  try {
    if (!req.files || !req.files.image) {
      return res.status(400).json({ error: "No image file provided" });
    }

    const formData = new FormData();
    formData.append('file', req.files.image.data, req.files.image.name);
    formData.append('language', 'eng');
    formData.append('isOverlayRequired', 'false');
    formData.append('OCREngine', '2');

    const response = await axios.post(
      'https://api.ocr.space/parse/image',
      formData,
      {
        headers: {
          apikey: process.env.OCR_API_KEY,
          ...formData.getHeaders()
        }
      }
    );

    res.json(response.data);
  } catch (error) {
    console.error("OCR Error:", error);
    res.status(500).json({ 
      error: "OCR processing failed",
      details: error.message 
    });
  }
});

module.exports = router;