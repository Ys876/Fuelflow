const express = require('express');
const cors = require('cors');
const { Groq } = require('groq-sdk');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const groq = new Groq({
  apiKey: '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'
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

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
