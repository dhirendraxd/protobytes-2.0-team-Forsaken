import express, { Request, Response } from 'express';
import cors from 'cors';
import path from 'path';
import usersRouter from './routes/users';
import voiceRouter from './routes/voice';
import twimlRouter from './routes/twiml';
import campaignRouter from './routes/campaigns';
import ttsRouter from './routes/tts';

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

app.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok' });
});

app.use('/api/users', usersRouter);
app.use('/api/voice', voiceRouter);
app.use('/api/twiml', twimlRouter);
app.use('/api/campaigns', campaignRouter);
app.use('/api/tts', ttsRouter);

app.get('/', (_req: Request, res: Response) => {
  res.send('Hello from TypeScript Express backend');
});

export default app;
