/**
 * FluentAI Optional Local Backend Server (Node.js + Express)
 * Provides REST API endpoints for User authentication, practice sessions,
 * mistake logs, and vocabulary when deploying with a free local MongoDB instance.
 */

const express = require('express');
const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    product: 'FluentAI Backend',
    cost: '₹0 Free',
    engine: 'Open Source Node.js + Express',
  });
});

// Authentication routes mock / controller
app.post('/api/auth/signup', (req, res) => {
  const { name, email, englishLevel } = req.body;
  res.json({
    success: true,
    user: {
      id: 'usr_' + Date.now(),
      name,
      email,
      englishLevel: englishLevel || 'Beginner',
      streak: 1,
    },
  });
});

app.post('/api/auth/login', (req, res) => {
  const { email } = req.body;
  res.json({
    success: true,
    user: {
      id: 'usr_demo',
      name: 'Alex Patel',
      email,
      englishLevel: 'Intermediate',
      streak: 5,
    },
  });
});

// Sessions endpoint
app.post('/api/sessions', (req, res) => {
  const sessionData = req.body;
  res.json({ success: true, recorded: sessionData });
});

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`FluentAI free local backend running on port ${PORT}`);
  });
}

module.exports = app;
