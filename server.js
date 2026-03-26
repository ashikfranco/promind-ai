import express from 'express';
import fetch from 'node-fetch';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// // 👉 Serve frontend
// app.use(express.static('.'));

// app.get('/', (req, res) => {
//   res.sendFile(path.resolve('index.html'));
// });

// ✅ Serve static files
app.use(express.static(path.join(process.cwd())));

// ✅ ROOT ROUTE (CRITICAL FIX)
app.get('/', (req, res) => {
  res.sendFile(path.join(process.cwd(), 'index.html'));
});

// 🔐 Use env instead of hardcoding
const API_KEY = process.env.ANTHROPIC_API_KEY;

app.post('/api/ai', async (req, res) => {
  try {
    console.log("Incoming request:", req.body);

    const { messages, system, max_tokens } = req.body;

  

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${API_KEY}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    model: "meta-llama/llama-3-8b-instruct", // free model
    messages: [
      { role: "system", content: system },
      ...messages
    ]
  })
});

// const data = await response.json();

// // adjust response format
// res.json({
//   content: [{ text: data.choices[0].message.content }]
// });

const data = await response.json();

console.log("OpenRouter response:", JSON.stringify(data, null, 2));

// ❌ If API returned error
if (!response.ok || data.error) {
  return res.status(500).json({
    error: data.error?.message || "OpenRouter API error"
  });
}

// ✅ Safe access
const aiText = data?.choices?.[0]?.message?.content;

if (!aiText) {
  return res.status(500).json({
    error: "No response from AI"
  });
}

// ✅ Send in your frontend format
res.json({
  content: [{ text: aiText }]
});

  } catch (err) {
    console.error("SERVER ERROR:", err);
    res.status(500).json({ error: err.message });
  }
});
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Running on ${PORT}`));

// app.listen(3000, () => console.log("🚀 Server running on http://localhost:3000"));