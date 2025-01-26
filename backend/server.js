const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const axios = require('axios');
const { Groq } = require('groq-sdk');
const https = require('https'); // Added https module

dotenv.config();

const app = express();
app.use(cors({
  origin: 'http://localhost:3000', // Allow requests from the frontend
}));
app.use(express.json());

const groq = new Groq({
  apiKey: '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'
});

const PORT = process.env.PORT || 5001;

// Test endpoint
app.get('/test', (req, res) => {
  res.json({ message: 'Backend is running!' });
});

app.get('/api/menu', async (req, res) => {
  try {
    const { diningCourt, mealType, date } = req.query;
    
    if (!diningCourt || !mealType) {
      return res.status(400).json({ 
        error: "Both diningCourt and mealType are required" 
      });
    }

    // Forward the request to the Python service
    const response = await axios.get('http://localhost:5002/api/menu', {
      params: { diningCourt, mealType, date }
    });

    res.json(response.data);
  } catch (error) {
    console.error('Error fetching menu:', error.response?.data || error.message);
    res.status(error.response?.status || 500).json({ 
      error: "Failed to fetch menu",
      details: error.response?.data?.error || error.message 
    });
  }
});

app.post('/api/analyze-meals', async (req, res) => {
  try {
    const { diningCourt, mealItems, cyclePhase } = req.body;

    const prompt = `${diningCourt} dining has ${mealItems.join(', ')}. I am in my ${cyclePhase} phase, what do I eat? Sort into a recommended and not recommended list. For each recommended item, explain why it's beneficial during this phase. For not recommended items, explain why they should be avoided.`;

    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "user",
          content: prompt
        }
      ],
      model: "llama-3.3-70b-versatile",
    });

    const analysis = completion.choices[0].message.content;

    // Parse the analysis into structured data
    const recommendations = {
      recommended: [],
      notRecommended: [],
      explanation: analysis
    };

    // Simple parsing of the response
    const sections = analysis.split('**');
    sections.forEach(section => {
      if (section.toLowerCase().includes('recommended:')) {
        const items = section.split('\n').slice(1).filter(item => item.trim());
        recommendations.recommended = items;
      } else if (section.toLowerCase().includes('not recommended:')) {
        const items = section.split('\n').slice(1).filter(item => item.trim());
        recommendations.notRecommended = items;
      }
    });

    res.json(recommendations);
  } catch (error) {
    console.error('Error analyzing meals:', error);
    res.status(500).json({ error: 'Failed to analyze meals' });
  }
});

// Period Tracker API endpoint
app.post('/api/predict-cycle', (req, res) => {
  const { cycleStartDate, nextCycleStartDate, periodLength } = req.body;

  // Dummy data for testing
  const cycleData = {
    prediction: {
      period: { start_date: "2025-01-01", end_date: "2025-01-05" },
      follicular: { start_date: "2025-01-06", end_date: "2025-01-16" },
      ovulation: { start_date: "2025-01-17", end_date: "2025-01-20" },
      luteal: { start_date: "2025-01-21", end_date: "2025-01-31" },
    },
    warnings: [],
  };

  res.json(cycleData);
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
