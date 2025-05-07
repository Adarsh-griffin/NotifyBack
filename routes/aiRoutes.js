const express = require('express');
const router = express.Router();
const axios = require('axios');
const { pipeline } = require('@xenova/transformers'); // For local fallback

// Configuration
const SERVICE_TIERS = [
  {
    name: "HuggingFace-DistilBART",
    url: "https://api-inference.huggingface.co/models/sshleifer/distilbart-cnn-12-6",
    timeout: 8000
  },
  {
    name: "HuggingFace-BART",
    url: "https://api-inference.huggingface.co/models/facebook/bart-large-cnn",
    timeout: 12000
  },
  {
    name: "Local-DistilBART",
    local: true,
    timeout: 15000
  }
];

// Initialize local model fallback
let localModel;
async function initializeLocalModel() {
  try {
    localModel = await pipeline('summarization', 'Xenova/distilbart-cnn-6-6');
    console.log('Local model loaded successfully');
  } catch (err) {
    console.error('Failed to load local model:', err.message);
  }
}
initializeLocalModel();

// Text processing utilities
const textProcessors = {
  basic: (text) => text.replace(/\n+/g, '\n').replace(/\s+/g, ' ').trim(),
  
  enhanced: async (text, model) => {
    if (model.local && localModel) {
      const result = await localModel(text, { max_length: 130 });
      return result[0]?.summary_text;
    }
    
    const response = await axios.post(
      model.url,
      { inputs: text },
      {
        headers: { 
          'Authorization': `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
          'Content-Type': 'application/json'
        },
        timeout: model.timeout
      }
    );
    return response.data[0]?.summary_text;
  }
};

router.post('/enhance-text', async (req, res) => {
  try {
    let { text } = req.body;
    
    // Validate input
    if (!text || typeof text !== 'string') {
      return res.status(400).json({ 
        error: 'Invalid input',
        message: 'Please provide valid text'
      });
    }

    text = text.trim();
    if (text.length < 10) {
      return res.json({
        success: true,
        enhancedText: text,
        message: 'Text too short for enhancement'
      });
    }

    // Try each service tier
    let lastError;
    for (const tier of SERVICE_TIERS) {
      try {
        const start = Date.now();
        const enhanced = await textProcessors.enhanced(text, tier);
        
        if (enhanced) {
          return res.json({
            success: true,
            enhancedText: enhanced,
            serviceUsed: tier.name,
            processingTime: Date.now() - start
          });
        }
      } catch (error) {
        lastError = error;
        console.error(`${tier.name} failed:`, error.message);
      }
    }

    // All services failed - use basic processing
    const cleaned = textProcessors.basic(text);
    return res.json({
      success: false,
      enhancedText: cleaned,
      message: 'All enhancement services failed',
      error: lastError?.message
    });

  } catch (error) {
    console.error('Enhancement error:', error);
    res.status(500).json({ 
      error: 'Processing failed',
      message: 'Text enhancement service unavailable',
      originalText: req.body.text,
      enhancedText: textProcessors.basic(req.body.text)
    });
  }
});

module.exports = router;