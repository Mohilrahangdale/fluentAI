import express from 'express';

const app = express();

app.use(express.json());

// Router handling both /api/* and root /* (in case Vercel rewrites strip the prefix)
const apiRouter = express.Router();

apiRouter.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    product: 'FluentAI',
    cost: '₹0 Free',
    engine: 'Vercel Serverless Function + Vite PWA',
    timestamp: new Date().toISOString(),
  });
});

apiRouter.post('/auth/signup', (req, res) => {
  const { name, email, englishLevel } = req.body || {};
  res.json({
    success: true,
    user: {
      id: 'usr_' + Date.now(),
      name: name || 'Learner',
      email: email || 'learner@fluentai.local',
      englishLevel: englishLevel || 'Beginner',
      streak: 1,
    },
  });
});

apiRouter.post('/auth/login', (req, res) => {
  const { email } = req.body || {};
  res.json({
    success: true,
    user: {
      id: 'usr_demo',
      name: 'Alex Patel',
      email: email || 'learner@fluentai.local',
      englishLevel: 'Intermediate',
      streak: 5,
    },
  });
});

apiRouter.post('/sessions', (req, res) => {
  const sessionData = req.body;
  res.json({
    success: true,
    message: 'Session recorded successfully',
    recorded: sessionData,
  });
});

// Mount on both /api and root
app.use('/api', apiRouter);
app.use('/', apiRouter);

export default app;
