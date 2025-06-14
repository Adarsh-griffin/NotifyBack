const express = require('express');
const router = express.Router();
const { GoogleGenerativeAI } = require('@google/generative-ai'); // For Gemini API

// --- Configuration ---
// Removed SERVICE_TIERS as we'll primarily use Gemini.
// Local fallback using @xenova/transformers remains a good option.

// Initialize local model fallback
const { pipeline } = require('@xenova/transformers'); // For local fallback
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

// Initialize Gemini
// Ensure you have GEMINI_API_KEY set in your environment variables.
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const geminiModel = genAI.getGenerativeModel({ model: "gemini-pro" }); // Using gemini-pro for text generation

// --- Text processing utilities ---
const textProcessors = {
    basic: (text) => text.replace(/\n+/g, '\n').replace(/\s+/g, ' ').trim(),

    geminiSummarize: async (text) => {
        try {
            const prompt = `Summarize the following text concisely and accurately:\n\n${text}\n\nSummary:`;
            const result = await geminiModel.generateContent(prompt);
            const response = await result.response;
            const summary = response.text();
            return summary.trim();
        } catch (error) {
            console.error('Gemini summarization failed:', error.message);
            throw new Error('Gemini API summarization error');
        }
    },

    localSummarize: async (text) => {
        if (localModel) {
            try {
                const result = await localModel(text, { max_length: 200, truncation: true }); // Added truncation for long texts
                return result[0]?.summary_text;
            } catch (error) {
                console.error('Local model summarization failed:', error.message);
                throw new Error('Local model summarization error');
            }
        }
        return null; // No local model available
    }
};

router.post('/', async (req, res) => {
  
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

    let enhancedText = null;
    let serviceUsed = 'None';
    let errorMessage = '';
    const start = Date.now();

    try {
        // Try Gemini first
        enhancedText = await textProcessors.geminiSummarize(text);
        if (enhancedText) {
            serviceUsed = 'Gemini';
        }
    } catch (geminiError) {
        console.error('Attempting local model due to Gemini failure:', geminiError.message);
        errorMessage = geminiError.message;
        // Fallback to local model if Gemini fails
        try {
            enhancedText = await textProcessors.localSummarize(text);
            if (enhancedText) {
                serviceUsed = 'Local-DistilBART';
            }
        } catch (localError) {
            console.error('Local model also failed:', localError.message);
            errorMessage += `; Local model failed: ${localError.message}`;
        }
    }

    const processingTime = Date.now() - start;

    if (enhancedText) {
        return res.json({
            success: true,
            enhancedText: enhancedText,
            serviceUsed: serviceUsed,
            processingTime: processingTime
        });
    } else {
        // All services failed - use basic processing
        const cleaned = textProcessors.basic(text);
        return res.json({
            success: false,
            enhancedText: cleaned,
            message: 'All enhancement services failed',
            error: errorMessage || 'Unknown error'
        });
    }
});

module.exports = router;